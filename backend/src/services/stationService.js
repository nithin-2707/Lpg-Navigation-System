const PHOTON_URL = "https://photon.komoot.io/api/";
const DEFAULT_LOCATION = { latitude: 16.4876, longitude: 80.5015 };
const CACHE_TTL_MS = 5 * 60 * 1000;
const PHOTON_QUERY_TERMS = [
  "petrol pump",
  "bharat petroleum",
  "indian oil",
  "hp petrol pump",
  "reliance petrol pump"
];

const cache = new Map();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

function getBearing(lat1, lng1, lat2, lng2) {
  const y = Math.sin(toRadians(lng2 - lng1)) * Math.cos(toRadians(lat2));
  const x =
    Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
    Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(toRadians(lng2 - lng1));
  return Math.atan2(y, x);
}

function getCacheKey(lat, lng, radiusKm, limit) {
  return [lat.toFixed(4), lng.toFixed(4), radiusKm, limit].join(":");
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeFeature(feature, originLat, originLng) {
  const properties = feature.properties || {};
  const coordinates = feature.geometry && feature.geometry.coordinates ? feature.geometry.coordinates : [];
  const longitude = coordinates[0];
  const latitude = coordinates[1];

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  const name = cleanText(properties.name) || cleanText(properties.brand) || cleanText(properties.operator) || "Fuel station";
  const locationParts = [properties.street, properties.district, properties.city, properties.county, properties.state]
    .map(cleanText)
    .filter(Boolean);
  const distanceKm = Number(getDistanceKm(originLat, originLng, latitude, longitude).toFixed(2));
  const openingHours = cleanText(properties.opening_hours);

  return {
    id: `${properties.osm_type || "osm"}-${properties.osm_id || `${latitude}-${longitude}`}`,
    name,
    location: locationParts.join(", ") || cleanText(properties.country) || "Live OSM station",
    city: cleanText(properties.city) || cleanText(properties.district) || cleanText(properties.county) || "",
    state: cleanText(properties.state) || "",
    latitude,
    longitude,
    distanceKm,
    brand: cleanText(properties.brand) || cleanText(properties.operator) || "",
    phone: cleanText(properties.phone) || "",
    website: cleanText(properties.website) || "",
    openingHours,
    isOpenInfoAvailable: Boolean(openingHours),
    source: "OpenStreetMap Photon"
  };
}

async function fetchLiveStations(lat = DEFAULT_LOCATION.latitude, lng = DEFAULT_LOCATION.longitude, options = {}) {
  const radiusKm = typeof options.radiusKm === "number" ? options.radiusKm : 60;
  const limit = typeof options.limit === "number" ? options.limit : 20;
  const cacheKey = getCacheKey(lat, lng, radiusKm, limit);
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  async function fetchByTerm(term) {
    const url = new URL(PHOTON_URL);
    url.searchParams.set("q", term);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("limit", String(Math.max(limit * 3, 40)));
    url.searchParams.set("lang", "en");
    url.searchParams.set("osm_tag", "amenity:fuel");

    const response = await fetch(url, {
      headers: {
        "User-Agent": "LPG-Navigation-System/1.0",
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    return (payload.features || [])
      .map((feature) => normalizeFeature(feature, lat, lng))
      .filter(Boolean);
  }

  const batches = await Promise.all(PHOTON_QUERY_TERMS.map((term) => fetchByTerm(term)));
  const stationMap = new Map();
  batches.flat().forEach((station) => {
    stationMap.set(station.id, station);
  });

  const stations = Array.from(stationMap.values()).sort((a, b) => a.distanceKm - b.distanceKm);
  const withinRadius = stations.filter((station) => station.distanceKm <= radiusKm);
  const result = withinRadius.length > 0 ? withinRadius.slice(0, limit) : stations.slice(0, Math.min(limit, 5));

  cache.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
}

function buildMapFeed(stations, centerLat, centerLng) {
  return stations.map((station) => {
    const bearing = getBearing(centerLat, centerLng, station.latitude, station.longitude);
    const distanceRatio = clamp(station.distanceKm / 60, 0, 1);
    const x = Number((50 + Math.sin(bearing) * distanceRatio * 38).toFixed(2));
    const y = Number((50 - Math.cos(bearing) * distanceRatio * 38).toFixed(2));

    return {
      id: station.id,
      name: station.name,
      available: true,
      latitude: station.latitude,
      longitude: station.longitude,
      x: clamp(x, 4, 96),
      y: clamp(y, 6, 94),
      location: station.location,
      city: station.city,
      state: station.state,
      distanceKm: station.distanceKm
    };
  });
}

async function getAllStations(lat, lng, options = {}) {
  return fetchLiveStations(lat, lng, options);
}

function getStationById() {
  return null;
}

async function updateStationStock() {
  return null;
}

async function getStationHistory() {
  return [];
}

async function getPriceAlerts() {
  return [];
}

async function getMapFeed(lat, lng, options = {}) {
  const stations = await fetchLiveStations(lat, lng, options);
  const centerLat = typeof lat === "number" ? lat : DEFAULT_LOCATION.latitude;
  const centerLng = typeof lng === "number" ? lng : DEFAULT_LOCATION.longitude;
  return buildMapFeed(stations, centerLat, centerLng);
}

async function getStationInsights(lat, lng, options = {}) {
  return fetchLiveStations(lat, lng, options);
}

async function getNearbyStations(lat, lng, options = {}) {
  return fetchLiveStations(lat, lng, options);
}

async function simulateRealtimeTick() {
  return {
    message: "Real-data mode does not simulate stock or price changes."
  };
}

module.exports = {
  DEFAULT_LOCATION,
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
