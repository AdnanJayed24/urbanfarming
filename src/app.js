const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const apiRoutes = require("./routes");
const docsRoutes = require("./routes/docs.routes");
const metricsMiddleware = require("./middlewares/metrics");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");
const { sendSuccess } = require("./utils/apiResponse");

const app = express();

app.locals.startedAt = new Date();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  return sendSuccess(res, 200, "Service is healthy.", {
    uptimeSeconds: Math.round(process.uptime())
  });
});

app.use("/api/docs", docsRoutes);
app.use(metricsMiddleware);
app.use("/api/v1", apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
