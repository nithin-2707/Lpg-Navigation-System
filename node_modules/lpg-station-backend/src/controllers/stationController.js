const {
  getAllStations,
  updateStationStock,
  getStationHistory,
  getPriceAlerts,
  getMapFeed,
  getStationInsights,
  getNearbyStations,
  simulateRealtimeTick
} = require("../services/stationService");

const availabilityEvents = [];

function listStations(req, res) {
  const stations = getAllStations();
  res.json(stations);
}

function updateStock(req, res) {
  const { id, available, trigger } = req.body;

  if (typeof id !== "number" || typeof available !== "boolean") {
    return res.status(400).json({
      message: "Invalid payload. Expected: { id: number, available: boolean }"
    });
  }

  const result = updateStationStock(id, available, trigger);

  if (!result) {
    return res.status(404).json({ message: "Station not found" });
  }

  const { station, previous } = result;

  if (!previous && station.available) {
    availabilityEvents.push({
      id: `${Date.now()}-${station.id}`,
      stationId: station.id,
      stationName: station.name,
      becameAvailableAt: new Date().toISOString()
    });
  }

  return res.json({
    message: "Stock updated successfully",
    station
  });
}

function listHistory(req, res) {
  res.json(getStationHistory());
}

function listPriceAlerts(req, res) {
  res.json(getPriceAlerts());
}

function listMapFeed(req, res) {
  res.json(getMapFeed());
}

function listStationInsights(req, res) {
  res.json(getStationInsights());
}

function listNearbyStations(req, res) {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : 60;
  const onlyAvailable = req.query.onlyAvailable === "true";

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({
      message: "Invalid query. Expected numeric lat and lng parameters."
    });
  }

  if (Number.isNaN(radiusKm) || radiusKm <= 0 || radiusKm > 5000) {
    return res.status(400).json({
      message: "Invalid radiusKm. Use a value between 1 and 5000."
    });
  }

  return res.json(
    getNearbyStations(lat, lng, {
      radiusKm,
      onlyAvailable,
      limit: 20
    })
  );
}

function triggerRealtimeTick(req, res) {
  const result = simulateRealtimeTick();
  res.json({
    message: "Realtime simulation tick complete",
    result
  });
}

function listAvailabilityAlerts(req, res) {
  const since = req.query.since;

  if (!since) {
    return res.json(availabilityEvents);
  }

  const sinceMs = Number(since);
  if (Number.isNaN(sinceMs)) {
    return res.status(400).json({
      message: "Invalid query parameter 'since'. Expected unix timestamp in milliseconds."
    });
  }

  const filtered = availabilityEvents.filter((event) => {
    return new Date(event.becameAvailableAt).getTime() > sinceMs;
  });

  return res.json(filtered);
}

module.exports = {
  listStations,
  updateStock,
  listAvailabilityAlerts,
  listHistory,
  listPriceAlerts,
  listMapFeed,
  listStationInsights,
  listNearbyStations,
  triggerRealtimeTick
};
