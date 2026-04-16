const express = require("express");
const prisma = require("../db/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const requireApprovedVendor = require("../middlewares/requireApprovedVendor");
const ApiError = require("../utils/ApiError");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { produceCreateSchema, produceListSchema, produceUpdateSchema, idParamSchema } = require("../validators/schemas");

const router = express.Router();

router.get(
  "/",
  validate(produceListSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const where = {
      isApproved: true
    };

    if (req.query.search) {
      where.OR = [
        { name: { contains: req.query.search, mode: "insensitive" } },
        { description: { contains: req.query.search, mode: "insensitive" } }
      ];
    }

    if (req.query.category) {
      where.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      where.price = {};

      if (req.query.minPrice) {
        where.price.gte = req.query.minPrice;
      }

      if (req.query.maxPrice) {
        where.price.lte = req.query.maxPrice;
      }
    }

    const [produce, total] = await prisma.$transaction([
      prisma.produce.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              farmName: true,
              farmLocation: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.produce.count({ where })
    ]);

    return sendSuccess(res, 200, "Marketplace produce fetched successfully.", { produce }, getPaginationMeta(total, page, limit));
  })
);

router.get(
  "/:id",
  validate(idParamSchema),
  asyncHandler(async (req, res) => {
    const produce = await prisma.produce.findFirst({
      where: {
        id: req.params.id,
        isApproved: true
      },
      include: {
        vendor: {
          select: {
            id: true,
            farmName: true,
            farmLocation: true,
            certificationStatus: true
          }
        }
      }
    });

    if (!produce) {
      throw new ApiError(404, "Produce item not found.");
    }

    return sendSuccess(res, 200, "Produce item fetched successfully.", { produce });
  })
);

router.post(
  "/",
  authenticate,
  authorize("VENDOR"),
  requireApprovedVendor,
  validate(produceCreateSchema),
  asyncHandler(async (req, res) => {
    const produce = await prisma.produce.create({
      data: {
        vendorId: req.user.vendorProfile.id,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        availableQuantity: req.body.availableQuantity,
        certificationStatus: req.user.vendorProfile.certificationStatus,
        isApproved: false
      }
    });

    return sendSuccess(res, 201, "Produce created and queued for admin approval.", {
      produce
    });
  })
);

router.patch(
  "/:id",
  authenticate,
  authorize("VENDOR"),
  requireApprovedVendor,
  validate(produceUpdateSchema),
  asyncHandler(async (req, res) => {
    const existingProduce = await prisma.produce.findFirst({
      where: {
        id: req.params.id,
        vendorId: req.user.vendorProfile.id
      }
    });

    if (!existingProduce) {
      throw new ApiError(404, "Produce item not found.");
    }

    const produce = await prisma.produce.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        isApproved: false
      }
    });

    return sendSuccess(res, 200, "Produce updated and re-queued for admin approval.", {
      produce
    });
  })
);

module.exports = router;
