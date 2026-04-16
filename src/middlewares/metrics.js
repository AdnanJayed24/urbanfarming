const { recordMetric } = require("../utils/metricsStore");

module.exports = function metricsMiddleware(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const completedAt = process.hrtime.bigint();
    const durationMs = Number(completedAt - startedAt) / 1000000;
    const routePath = req.route?.path ? `${req.baseUrl}${req.route.path}` : req.originalUrl.split("?")[0];

    recordMetric(`${req.method} ${routePath}`, durationMs, res.statusCode);
  });

  next();
};
