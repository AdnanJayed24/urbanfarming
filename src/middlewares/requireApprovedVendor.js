const ApiError = require("../utils/ApiError");

module.exports = function requireApprovedVendor(req, res, next) {
  if (!req.user?.vendorProfile) {
    return next(new ApiError(403, "Vendor profile is required for this action."));
  }

  if (!req.user.vendorProfile.isApproved) {
    return next(new ApiError(403, "Vendor approval is pending admin review."));
  }

  next();
};
