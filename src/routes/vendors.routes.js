const express = require("express");
const prisma = require("../db/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { communityListSchema, sustainabilityCertCreateSchema, vendorProfileUpdateSchema } = require("../validators/schemas");

const router = express.Router();

router.get(
  "/",
  validate(communityListSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);

    const [vendors, total] = await prisma.$transaction([
      prisma.vendorProfile.findMany({
        where: { isApproved: true },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.vendorProfile.count({ where: { isApproved: true } })
    ]);

    return sendSuccess(res, 200, "Approved vendors fetched successfully.", { vendors }, getPaginationMeta(total, page, limit));
  })
);

router.get(
  "/me/profile",
  authenticate,
  authorize("VENDOR"),
  asyncHandler(async (req, res) => {
    return sendSuccess(res, 200, "Vendor profile fetched successfully.", {
      vendorProfile: req.user.vendorProfile
    });
  })
);

router.patch(
  "/me/profile",
  authenticate,
  authorize("VENDOR"),
  validate(vendorProfileUpdateSchema),
  asyncHandler(async (req, res) => {
    const vendorProfile = await prisma.vendorProfile.update({
      where: { userId: req.user.id },
      data: req.body
    });

    return sendSuccess(res, 200, "Vendor profile updated successfully.", {
      vendorProfile
    });
  })
);

router.get(
  "/me/certifications",
  authenticate,
  authorize("VENDOR"),
  asyncHandler(async (req, res) => {
    const certifications = await prisma.sustainabilityCert.findMany({
      where: { vendorId: req.user.vendorProfile.id },
      orderBy: { createdAt: "desc" }
    });

    return sendSuccess(res, 200, "Vendor certifications fetched successfully.", {
      certifications
    });
  })
);

router.post(
  "/me/certifications",
  authenticate,
  authorize("VENDOR"),
  validate(sustainabilityCertCreateSchema),
  asyncHandler(async (req, res) => {
    const certification = await prisma.sustainabilityCert.create({
      data: {
        vendorId: req.user.vendorProfile.id,
        certifyingAgency: req.body.certifyingAgency,
        certificationDate: req.body.certificationDate,
        certificateUrl: req.body.certificateUrl,
        notes: req.body.notes
      }
    });

    await prisma.vendorProfile.update({
      where: { id: req.user.vendorProfile.id },
      data: { certificationStatus: "PENDING" }
    });

    return sendSuccess(res, 201, "Certification submitted for admin review.", {
      certification
    });
  })
);

module.exports = router;
