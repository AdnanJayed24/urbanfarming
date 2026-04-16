const express = require("express");
const authRoutes = require("./auth.routes");
const vendorRoutes = require("./vendors.routes");
const produceRoutes = require("./produce.routes");
const rentalRoutes = require("./rentals.routes");
const orderRoutes = require("./orders.routes");
const plantRoutes = require("./plants.routes");
const communityRoutes = require("./community.routes");
const adminRoutes = require("./admin.routes");
const metricsRoutes = require("./metrics.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/vendors", vendorRoutes);
router.use("/produce", produceRoutes);
router.use("/rentals", rentalRoutes);
router.use("/orders", orderRoutes);
router.use("/plants", plantRoutes);
router.use("/community", communityRoutes);
router.use("/admin", adminRoutes);
router.use("/metrics", metricsRoutes);

module.exports = router;
