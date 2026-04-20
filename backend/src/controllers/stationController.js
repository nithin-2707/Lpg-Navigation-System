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

function parseLocation(req) {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lng);
  return {
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    radiusKm: req.query.radiusKm ? Number(req.query.radiusKm) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    onlyAvailable: req.query.onlyAvailable === "true"
  };
}

async function listStations(req, res) {
  const { latitude, longitude, radiusKm, limit } = parseLocation(req);
  const stations = await getAllStations(latitude, longitude, { radiusKm, limit });
  res.json(stations);
}

async function updateStock(req, res) {
  const { id, available, trigger } = req.body;

  if (typeof id !== "number" || typeof available !== "boolean") {
    return res.status(405).json({
      message: "Real-data mode is read-only. Stock updates are not supported."
    });
  }

  return res.status(405).json({
    message: "Real-data mode is read-only. Stock updates are not supported.",
    trigger
  });
}

async function listHistory(req, res) {
  res.json(await getStationHistory());
}

async function listPriceAlerts(req, res) {
  res.json(await getPriceAlerts());
}

async function listMapFeed(req, res) {
  const { latitude, longitude, radiusKm, limit } = parseLocation(req);
  res.json(await getMapFeed(latitude, longitude, { radiusKm, limit }));
}

async function listStationInsights(req, res) {
  const { latitude, longitude, radiusKm, limit } = parseLocation(req);
  res.json(await getStationInsights(latitude, longitude, { radiusKm, limit }));
}

async function listNearbyStations(req, res) {
  const { latitude, longitude, radiusKm, limit, onlyAvailable } = parseLocation(req);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
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
    await getNearbyStations(latitude, longitude, {
      radiusKm: radiusKm || 60,
      onlyAvailable,
      limit: limit || 20
    })
  );
}

async function triggerRealtimeTick(req, res) {
  const result = await simulateRealtimeTick();
  res.json({
    message: result.message,
    result
  });
}

async function listAvailabilityAlerts(req, res) {
  res.json([]);
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
