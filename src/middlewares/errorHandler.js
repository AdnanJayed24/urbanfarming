const { ZodError } = require("zod");
const { Prisma } = require("@prisma/client");
const { sendError } = require("../utils/apiResponse");

module.exports = function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    return sendError(res, 400, "Validation failed", error.issues);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return sendError(res, 409, "A record with this value already exists.");
    }

    if (error.code === "P2025") {
      return sendError(res, 404, "Requested record was not found.");
    }
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error.";

  return sendError(res, statusCode, message, error.details || null);
};
