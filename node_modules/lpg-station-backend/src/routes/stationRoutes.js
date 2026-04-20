const express = require("express");
const {
  listStations,
  updateStock,
  listAvailabilityAlerts,
  listHistory,
  listPriceAlerts,
  listMapFeed,
  listStationInsights,
  listNearbyStations,
  triggerRealtimeTick
} = require("../controllers/stationController");

const router = express.Router();

router.get("/stations", listStations);
router.post("/update-stock", updateStock);
router.get("/alerts", listAvailabilityAlerts);
router.get("/history", listHistory);
router.get("/price-alerts", listPriceAlerts);
router.get("/map-feed", listMapFeed);
router.get("/station-insights", listStationInsights);
router.get("/nearby-stations", listNearbyStations);
router.post("/simulate-tick", triggerRealtimeTick);

module.exports = router;
