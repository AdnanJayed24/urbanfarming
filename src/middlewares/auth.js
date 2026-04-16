const prisma = require("../db/prisma");
const ApiError = require("../utils/ApiError");
const { verifyToken, sanitizeUser } = require("../utils/auth");

module.exports = async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authentication token is required.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { vendorProfile: true }
    });

    if (!user) {
      throw new ApiError(401, "User associated with this token was not found.");
    }

    if (user.status === "SUSPENDED") {
      throw new ApiError(403, "This account is suspended.");
    }

    req.user = sanitizeUser(user);
    next();
  } catch (error) {
    next(error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" ? new ApiError(401, "Invalid or expired token.") : error);
  }
};
