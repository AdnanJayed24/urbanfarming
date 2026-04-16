const express = require("express");
const { Role } = require("@prisma/client");
const prisma = require("../db/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const { hashPassword, comparePassword, signToken, sanitizeUser } = require("../utils/auth");
const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/auth");
const ApiError = require("../utils/ApiError");
const { createRateLimiter } = require("../middlewares/rateLimiter");
const { registerCustomerSchema, registerVendorSchema, loginSchema } = require("../validators/schemas");

const router = express.Router();

const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: "Too many authentication attempts. Please try again in 15 minutes."
});

router.post(
  "/register/customer",
  authRateLimiter,
  validate(registerCustomerSchema),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: await hashPassword(req.body.password),
        role: Role.CUSTOMER
      }
    });

    return sendSuccess(res, 201, "Customer registered successfully.", {
      user: sanitizeUser(user)
    });
  })
);

router.post(
  "/register/vendor",
  authRateLimiter,
  validate(registerVendorSchema),
  asyncHandler(async (req, res) => {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          password: await hashPassword(req.body.password),
          role: Role.VENDOR
        }
      });

      const vendorProfile = await tx.vendorProfile.create({
        data: {
          userId: user.id,
          farmName: req.body.farmName,
          farmLocation: req.body.farmLocation
        }
      });

      return { user, vendorProfile };
    });

    return sendSuccess(res, 201, "Vendor registered and queued for admin approval.", {
      user: sanitizeUser(result.user),
      vendorProfile: result.vendorProfile
    });
  })
);

router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
      include: { vendorProfile: true }
    });

    if (!user || !(await comparePassword(req.body.password, user.password))) {
      throw new ApiError(401, "Invalid email or password.");
    }

    if (user.status === "SUSPENDED") {
      throw new ApiError(403, "This account is suspended.");
    }

    const token = signToken({
      userId: user.id,
      role: user.role
    });

    return sendSuccess(res, 200, "Login successful.", {
      token,
      user: sanitizeUser(user)
    });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    return sendSuccess(res, 200, "Authenticated user fetched successfully.", {
      user: req.user
    });
  })
);

module.exports = router;
