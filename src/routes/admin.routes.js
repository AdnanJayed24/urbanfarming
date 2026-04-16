const express = require("express");
const prisma = require("../db/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const { certificationReviewSchema, produceReviewSchema, vendorApprovalSchema } = require("../validators/schemas");

const router = express.Router();

router.use(authenticate, authorize("ADMIN"));

router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const [users, vendorsPending, certsPending, producePending, activeOrders] = await Promise.all([
      prisma.user.count(),
      prisma.vendorProfile.count({ where: { isApproved: false } }),
      prisma.sustainabilityCert.count({ where: { certificationStatus: "PENDING" } }),
      prisma.produce.count({ where: { isApproved: false } }),
      prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "SHIPPED"] } } })
    ]);

    return sendSuccess(res, 200, "Admin dashboard summary fetched successfully.", {
      summary: {
        totalUsers: users,
        pendingVendorApprovals: vendorsPending,
        pendingCertifications: certsPending,
        pendingProduceApprovals: producePending,
        activeOrders
      }
    });
  })
);

router.get(
  "/vendors/pending",
  asyncHandler(async (req, res) => {
    const vendors = await prisma.vendorProfile.findMany({
      where: { isApproved: false },
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
      orderBy: { createdAt: "asc" }
    });

    return sendSuccess(res, 200, "Pending vendors fetched successfully.", {
      vendors
    });
  })
);

router.patch(
  "/vendors/:vendorProfileId/approval",
  validate(vendorApprovalSchema),
  asyncHandler(async (req, res) => {
    const vendorProfile = await prisma.vendorProfile.update({
      where: { id: req.params.vendorProfileId },
      data: {
        isApproved: req.body.isApproved,
        approvalNotes: req.body.approvalNotes || null
      }
    });

    return sendSuccess(res, 200, "Vendor approval updated successfully.", {
      vendorProfile
    });
  })
);

router.get(
  "/certifications/pending",
  asyncHandler(async (req, res) => {
    const certifications = await prisma.sustainabilityCert.findMany({
      where: { certificationStatus: "PENDING" },
      include: {
        vendor: {
          select: {
            id: true,
            farmName: true,
            farmLocation: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return sendSuccess(res, 200, "Pending certifications fetched successfully.", {
      certifications
    });
  })
);

router.patch(
  "/certifications/:certId/review",
  validate(certificationReviewSchema),
  asyncHandler(async (req, res) => {
    const certification = await prisma.sustainabilityCert.update({
      where: { id: req.params.certId },
      data: {
        certificationStatus: req.body.certificationStatus,
        notes: req.body.notes
      }
    });

    await prisma.vendorProfile.update({
      where: { id: certification.vendorId },
      data: {
        certificationStatus: req.body.certificationStatus
      }
    });

    return sendSuccess(res, 200, "Certification review updated successfully.", {
      certification
    });
  })
);

router.patch(
  "/produce/:produceId/review",
  validate(produceReviewSchema),
  asyncHandler(async (req, res) => {
    const produce = await prisma.produce.update({
      where: { id: req.params.produceId },
      data: {
        isApproved: req.body.isApproved,
        certificationStatus: req.body.certificationStatus
      }
    });

    return sendSuccess(res, 200, "Produce review updated successfully.", {
      produce
    });
  })
);

module.exports = router;
