const { sendError } = require("../utils/apiResponse");

module.exports = function notFound(req, res) {
  return sendError(res, 404, "Route not found.");
};
