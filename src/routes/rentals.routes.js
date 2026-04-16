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
const { bookingCreateSchema, rentalSpaceCreateSchema, rentalSpaceListSchema, rentalSpaceUpdateSchema } = require("../validators/schemas");

const router = express.Router();

router.get(
  "/bookings",
  authenticate,
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const where = {};

    if (req.user.role === "CUSTOMER") {
      where.userId = req.user.id;
    }

    if (req.user.role === "VENDOR") {
      where.rentalSpace = { vendorId: req.user.vendorProfile.id };
    }

    const [bookings, total] = await prisma.$transaction([
      prisma.rentalBooking.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          rentalSpace: {
            include: {
              vendor: {
                select: {
                  id: true,
                  farmName: true,
                  farmLocation: true
                }
              }
            }
          }
        },
        orderBy: { bookedAt: "desc" },
        skip,
        take: limit
      }),
      prisma.rentalBooking.count({ where })
    ]);

    return sendSuccess(res, 200, "Rental bookings fetched successfully.", { bookings }, getPaginationMeta(total, page, limit));
  })
);

router.get(
  "/",
  validate(rentalSpaceListSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const where = {
      vendor: {
        isApproved: true
      }
    };

    if (req.query.location) {
      where.location = {
        contains: req.query.location,
        mode: "insensitive"
      };
    }

    if (req.query.availability) {
      where.availability = req.query.availability;
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

    const [rentalSpaces, total] = await prisma.$transaction([
      prisma.rentalSpace.findMany({
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
      prisma.rentalSpace.count({ where })
    ]);

    return sendSuccess(res, 200, "Rental spaces fetched successfully.", { rentalSpaces }, getPaginationMeta(total, page, limit));
  })
);

router.post(
  "/",
  authenticate,
  authorize("VENDOR"),
  requireApprovedVendor,
  validate(rentalSpaceCreateSchema),
  asyncHandler(async (req, res) => {
    const rentalSpace = await prisma.rentalSpace.create({
      data: {
        vendorId: req.user.vendorProfile.id,
        ...req.body
      }
    });

    return sendSuccess(res, 201, "Rental space created successfully.", {
      rentalSpace
    });
  })
);

router.patch(
  "/:id",
  authenticate,
  authorize("VENDOR"),
  requireApprovedVendor,
  validate(rentalSpaceUpdateSchema),
  asyncHandler(async (req, res) => {
    const existingRentalSpace = await prisma.rentalSpace.findFirst({
      where: {
        id: req.params.id,
        vendorId: req.user.vendorProfile.id
      }
    });

    if (!existingRentalSpace) {
      throw new ApiError(404, "Rental space not found.");
    }

    const rentalSpace = await prisma.rentalSpace.update({
      where: { id: req.params.id },
      data: req.body
    });

    return sendSuccess(res, 200, "Rental space updated successfully.", {
      rentalSpace
    });
  })
);

router.post(
  "/:id/bookings",
  authenticate,
  authorize("CUSTOMER"),
  validate(bookingCreateSchema),
  asyncHandler(async (req, res) => {
    const space = await prisma.rentalSpace.findUnique({
      where: { id: req.params.id },
      include: { vendor: true }
    });

    if (!space || !space.vendor.isApproved) {
      throw new ApiError(404, "Rental space not found.");
    }

    if (space.availability !== "AVAILABLE") {
      throw new ApiError(409, "Rental space is not currently available.");
    }

    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.rentalBooking.create({
        data: {
          rentalSpaceId: space.id,
          userId: req.user.id,
          startDate: req.body.startDate,
          endDate: req.body.endDate
        }
      });

      await tx.rentalSpace.update({
        where: { id: space.id },
        data: {
          availability: "BOOKED"
        }
      });

      return createdBooking;
    });

    return sendSuccess(res, 201, "Rental space booked successfully.", {
      booking
    });
  })
);

module.exports = router;
