const express = require("express");
const env = require("../config/env");
const { sendSuccess } = require("../utils/apiResponse");
const { getBenchmarkReport } = require("../utils/metricsStore");

const router = express.Router();

router.get("/benchmark", (req, res) => {
  return sendSuccess(res, 200, "Benchmark report generated successfully.", {
    application: env.appName,
    benchmark: getBenchmarkReport(req.app.locals.startedAt)
  });
});

module.exports = router;
