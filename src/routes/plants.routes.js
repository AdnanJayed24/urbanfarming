const express = require("express");
const prisma = require("../db/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/auth");
const ApiError = require("../utils/ApiError");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { broadcast, registerClient, unregisterClient } = require("../utils/sseHub");
const { plantListSchema, plantRecordCreateSchema, plantRecordUpdateSchema } = require("../validators/schemas");

const router = express.Router();

router.get(
  "/stream",
  authenticate,
  asyncHandler(async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write(`event: connected\ndata: ${JSON.stringify({ message: "Plant tracking stream connected." })}\n\n`);
    registerClient(res);

    req.on("close", () => {
      unregisterClient(res);
    });
  })
);

router.get(
  "/",
  authenticate,
  validate(plantListSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const where = {};

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.user.role !== "ADMIN") {
      where.userId = req.user.id;
    }

    const [plantRecords, total] = await prisma.$transaction([
      prisma.plantRecord.findMany({
        where,
        include: {
          rentalBooking: {
            include: {
              rentalSpace: true
            }
          }
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit
      }),
      prisma.plantRecord.count({ where })
    ]);

    return sendSuccess(res, 200, "Plant tracking records fetched successfully.", { plantRecords }, getPaginationMeta(total, page, limit));
  })
);

router.post(
  "/",
  authenticate,
  validate(plantRecordCreateSchema),
  asyncHandler(async (req, res) => {
    if (req.user.role !== "CUSTOMER") {
      throw new ApiError(403, "Only customers can create plant tracking records.");
    }

    if (req.body.rentalBookingId) {
      const booking = await prisma.rentalBooking.findFirst({
        where: {
          id: req.body.rentalBookingId,
          userId: req.user.id
        }
      });

      if (!booking) {
        throw new ApiError(404, "Rental booking not found for this customer.");
      }
    }

    const plantRecord = await prisma.plantRecord.create({
      data: {
        userId: req.user.id,
        ...req.body
      }
    });

    broadcast("plant.created", {
      plantRecordId: plantRecord.id,
      plantName: plantRecord.plantName,
      status: plantRecord.status,
      healthStatus: plantRecord.healthStatus,
      updatedAt: plantRecord.updatedAt
    });

    return sendSuccess(res, 201, "Plant tracking record created successfully.", {
      plantRecord
    });
  })
);

router.patch(
  "/:id",
  authenticate,
  validate(plantRecordUpdateSchema),
  asyncHandler(async (req, res) => {
    const where = {
      id: req.params.id
    };

    if (req.user.role !== "ADMIN") {
      where.userId = req.user.id;
    }

    const existingPlantRecord = await prisma.plantRecord.findFirst({ where });

    if (!existingPlantRecord) {
      throw new ApiError(404, "Plant tracking record not found.");
    }

    const plantRecord = await prisma.plantRecord.update({
      where: { id: req.params.id },
      data: req.body
    });

    broadcast("plant.updated", {
      plantRecordId: plantRecord.id,
      plantName: plantRecord.plantName,
      status: plantRecord.status,
      healthStatus: plantRecord.healthStatus,
      updatedAt: plantRecord.updatedAt
    });

    return sendSuccess(res, 200, "Plant tracking record updated successfully.", {
      plantRecord
    });
  })
);

module.exports = router;
