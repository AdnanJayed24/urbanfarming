const express = require("express");
const prisma = require("../db/prisma");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/apiResponse");
const validate = require("../middlewares/validate");
const authenticate = require("../middlewares/auth");
const ApiError = require("../utils/ApiError");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const { communityListSchema, communityPostCreateSchema, communityPostUpdateSchema, idParamSchema } = require("../validators/schemas");

const router = express.Router();

router.get(
  "/posts",
  validate(communityListSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);

    const [posts, total] = await prisma.$transaction([
      prisma.communityPost.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: { postDate: "desc" },
        skip,
        take: limit
      }),
      prisma.communityPost.count()
    ]);

    return sendSuccess(res, 200, "Community posts fetched successfully.", { posts }, getPaginationMeta(total, page, limit));
  })
);

router.get(
  "/posts/:id",
  validate(idParamSchema),
  asyncHandler(async (req, res) => {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!post) {
      throw new ApiError(404, "Community post not found.");
    }

    return sendSuccess(res, 200, "Community post fetched successfully.", { post });
  })
);

router.post(
  "/posts",
  authenticate,
  validate(communityPostCreateSchema),
  asyncHandler(async (req, res) => {
    const post = await prisma.communityPost.create({
      data: {
        userId: req.user.id,
        postContent: req.body.postContent
      }
    });

    return sendSuccess(res, 201, "Community post created successfully.", {
      post
    });
  })
);

router.patch(
  "/posts/:id",
  authenticate,
  validate(communityPostUpdateSchema),
  asyncHandler(async (req, res) => {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id }
    });

    if (!post) {
      throw new ApiError(404, "Community post not found.");
    }

    if (req.user.role !== "ADMIN" && post.userId !== req.user.id) {
      throw new ApiError(403, "You can only update your own community posts.");
    }

    const updatedPost = await prisma.communityPost.update({
      where: { id: req.params.id },
      data: {
        postContent: req.body.postContent
      }
    });

    return sendSuccess(res, 200, "Community post updated successfully.", {
      post: updatedPost
    });
  })
);

router.delete(
  "/posts/:id",
  authenticate,
  validate(idParamSchema),
  asyncHandler(async (req, res) => {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id }
    });

    if (!post) {
      throw new ApiError(404, "Community post not found.");
    }

    if (req.user.role !== "ADMIN" && post.userId !== req.user.id) {
      throw new ApiError(403, "You can only delete your own community posts.");
    }

    await prisma.communityPost.delete({
      where: { id: req.params.id }
    });

    return sendSuccess(res, 200, "Community post deleted successfully.");
  })
);

module.exports = router;
