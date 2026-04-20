const { stations } = require("../data/stations");

const INDIA_BOUNDS = {
  minLat: 6.5,
  maxLat: 37.6,
  minLng: 68.1,
  maxLng: 97.4
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toMapX(longitude) {
  const ratio = (longitude - INDIA_BOUNDS.minLng) / (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng);
  return Number((10 + clamp(ratio, 0, 1) * 80).toFixed(2));
}

function toMapY(latitude) {
  const ratio = (INDIA_BOUNDS.maxLat - latitude) / (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat);
  return Number((12 + clamp(ratio, 0, 1) * 72).toFixed(2));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

const stationMeta = new Map(
  stations.map((station, index) => [
    station.id,
    {
      petrolPrice: Number((102 + index * 0.45).toFixed(2)),
      dieselPrice: Number((92 + index * 0.4).toFixed(2)),
      autoLpgPrice: Number((67 + index * 0.35).toFixed(2)),
      capacity: 45 + ((station.id * 13) % 50),
      operatingHours: "24 Hours",
      mapX: toMapX(station.longitude),
      mapY: toMapY(station.latitude),
      lastUpdatedAt: new Date().toISOString()
    }
  ])
);

const historyLog = [];
const priceAlerts = [];

function appendHistoryEntry(entry) {
  historyLog.unshift(entry);
  if (historyLog.length > 120) {
    historyLog.length = 120;
  }
}

function appendPriceAlert(entry) {
  priceAlerts.unshift(entry);
  if (priceAlerts.length > 120) {
    priceAlerts.length = 120;
  }
}

function getAllStations() {
  return stations;
}

function getStationById(id) {
  return stations.find((item) => item.id === id) || null;
}

function updateStationStock(id, available, trigger = "Manual Toggle (Admin)") {
  const station = stations.find((item) => item.id === id);

  if (!station) {
    return null;
  }

  const previous = station.available;
  station.available = available;

  const meta = stationMeta.get(station.id);
  if (meta) {
    meta.capacity = Math.max(2, Math.min(98, meta.capacity + (available ? 7 : -9)));
    meta.lastUpdatedAt = new Date().toISOString();
  }

  appendHistoryEntry({
    id: `${Date.now()}-${station.id}-${Math.floor(Math.random() * 1000)}`,
    stationId: station.id,
    stationName: station.name,
    action: available ? "Available" : "Not Available",
    trigger,
    reach: `${Math.floor(220 + Math.random() * 980)} pings`,
    timestamp: new Date().toISOString()
  });

  return { station, previous };
}

function getStationHistory() {
  return historyLog;
}

function getPriceAlerts() {
  return priceAlerts;
}

function getMapFeed() {
  return stations.map((station) => {
    const meta = stationMeta.get(station.id);
    return {
      id: station.id,
      name: station.name,
      available: station.available,
      latitude: station.latitude,
      longitude: station.longitude,
      x: meta ? meta.mapX : 25,
      y: meta ? meta.mapY : 25
    };
  });
}

function getStationInsights() {
  return stations.map((station) => {
    const meta = stationMeta.get(station.id);
    return {
      id: station.id,
      name: station.name,
      location: station.location,
      city: station.city,
      state: station.state,
      latitude: station.latitude,
      longitude: station.longitude,
      available: station.available,
      petrolPrice: meta ? meta.petrolPrice : 0,
      dieselPrice: meta ? meta.dieselPrice : 0,
      autoLpgPrice: meta ? meta.autoLpgPrice : 0,
      capacity: meta ? meta.capacity : 0,
      operatingHours: meta ? meta.operatingHours : "N/A",
      lastUpdatedAt: meta ? meta.lastUpdatedAt : new Date().toISOString()
    };
  });
}

function getNearbyStations(lat, lng, options = {}) {
  const radiusKm = typeof options.radiusKm === "number" ? options.radiusKm : 60;
  const limit = typeof options.limit === "number" ? options.limit : 20;
  const onlyAvailable = Boolean(options.onlyAvailable);

  const ranked = getStationInsights()
    .map((station) => {
      const distanceKm = getDistanceKm(lat, lng, station.latitude, station.longitude);
      return {
        ...station,
        distanceKm: Number(distanceKm.toFixed(2))
      };
    })
    .filter((station) => (onlyAvailable ? station.available : true))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const withinRadius = ranked.filter((station) => station.distanceKm <= radiusKm);
  if (withinRadius.length > 0) {
    return withinRadius.slice(0, limit);
  }

  // Always return closest stations even when no one falls in radius.
  return ranked.slice(0, Math.min(5, limit));
}

function simulateRealtimeTick() {
  const selected = stations[Math.floor(Math.random() * stations.length)];
  if (!selected) {
    return null;
  }

  const meta = stationMeta.get(selected.id);
  if (!meta) {
    return null;
  }

  const shouldFlipAvailability = Math.random() > 0.6;
  if (shouldFlipAvailability) {
    updateStationStock(selected.id, !selected.available, "Automatic Supply Monitor");
  }

  const fuelTypes = ["petrol", "diesel"];
  const selectedFuelType = fuelTypes[Math.floor(Math.random() * fuelTypes.length)];
  const swing = Number((Math.random() * 1.4 - 0.7).toFixed(2));
  const key = selectedFuelType === "petrol" ? "petrolPrice" : "dieselPrice";
  const previousPrice = meta[key];
  meta[key] = Number(Math.max(60, Math.min(150, meta[key] + swing)).toFixed(2));
  meta.capacity = Math.max(2, Math.min(99, meta.capacity + Math.floor(Math.random() * 11 - 5)));
  meta.lastUpdatedAt = new Date().toISOString();

  if (Math.abs(meta[key] - previousPrice) >= 0.3) {
    appendPriceAlert({
      id: `${Date.now()}-price-${selected.id}`,
      stationId: selected.id,
      stationName: selected.name,
      fuelType: selectedFuelType,
      previousPrice,
      currentPrice: meta[key],
      delta: Number((meta[key] - previousPrice).toFixed(2)),
      timestamp: new Date().toISOString()
    });
  }

  return {
    stationId: selected.id,
    stationName: selected.name,
    updatedAt: meta.lastUpdatedAt
  };
}

stations.forEach((station) => {
  appendHistoryEntry({
    id: `${Date.now()}-seed-${station.id}`,
    stationId: station.id,
    stationName: station.name,
    action: station.available ? "Available" : "Not Available",
    trigger: "System Bootstrap",
    reach: `${Math.floor(180 + Math.random() * 500)} pings`,
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  getAllStations,
  getStationById,
  updateStationStock,
  getStationHistory,
  getPriceAlerts,
  getMapFeed,
  getStationInsights,
  getNearbyStations,
  simulateRealtimeTick
};
