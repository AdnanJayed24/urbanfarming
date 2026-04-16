const ApiError = require("../utils/ApiError");

module.exports = function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (!result.success) {
      return next(
        new ApiError(
          400,
          "Validation failed",
          result.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        )
      );
    }

    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;

    next();
  };
};
