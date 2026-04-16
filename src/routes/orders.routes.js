const express = require("express");
const prisma = require("../db/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/auth");
const ApiError = require("../utils/ApiError");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { orderCreateSchema, orderListSchema, orderStatusUpdateSchema } = require("../validators/schemas");

const router = express.Router();

router.post(
  "/",
  authenticate,
  validate(orderCreateSchema),
  asyncHandler(async (req, res) => {
    if (req.user.role !== "CUSTOMER") {
      throw new ApiError(403, "Only customers can create orders.");
    }

    const produce = await prisma.produce.findFirst({
      where: {
        id: req.body.produceId,
        isApproved: true
      }
    });

    if (!produce) {
      throw new ApiError(404, "Approved produce item not found.");
    }

    if (produce.availableQuantity < req.body.quantity) {
      throw new ApiError(409, "Requested quantity exceeds available stock.");
    }

    const quantity = req.body.quantity;
    const totalAmount = Number(produce.price) * quantity;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          produceId: produce.id,
          vendorId: produce.vendorId,
          quantity,
          totalAmount
        }
      });

      await tx.produce.update({
        where: { id: produce.id },
        data: {
          availableQuantity: produce.availableQuantity - quantity
        }
      });

      return createdOrder;
    });

    return sendSuccess(res, 201, "Order placed successfully.", {
      order
    });
  })
);

router.get(
  "/",
  authenticate,
  validate(orderListSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const where = {};

    if (req.query.status) {
      where.status = req.query.status;
    }

    if (req.user.role === "CUSTOMER") {
      where.userId = req.user.id;
    }

    if (req.user.role === "VENDOR") {
      where.vendorId = req.user.vendorProfile.id;
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          produce: {
            select: {
              id: true,
              name: true,
              price: true,
              category: true
            }
          },
          vendor: {
            select: {
              id: true,
              farmName: true
            }
          }
        },
        orderBy: { orderDate: "desc" },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    return sendSuccess(res, 200, "Orders fetched successfully.", { orders }, getPaginationMeta(total, page, limit));
  })
);

router.patch(
  "/:id/status",
  authenticate,
  validate(orderStatusUpdateSchema),
  asyncHandler(async (req, res) => {
    const existingOrder = await prisma.order.findUnique({
      where: { id: req.params.id }
    });

    if (!existingOrder) {
      throw new ApiError(404, "Order not found.");
    }

    if (!["ADMIN", "VENDOR"].includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to update order status.");
    }

    if (req.user.role === "VENDOR" && existingOrder.vendorId !== req.user.vendorProfile.id) {
      throw new ApiError(403, "You can only manage orders for your own listings.");
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status: req.body.status
      }
    });

    return sendSuccess(res, 200, "Order status updated successfully.", {
      order
    });
  })
);

module.exports = router;
