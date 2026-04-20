const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function buildLocationQuery(lat, lng, options = {}) {
  const params = new URLSearchParams();
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    params.set("lat", String(lat));
    params.set("lng", String(lng));
  }
  if (Number.isFinite(options.radiusKm)) {
    params.set("radiusKm", String(options.radiusKm));
  }
  if (Number.isFinite(options.limit)) {
    params.set("limit", String(options.limit));
  }
  if (typeof options.onlyAvailable === "boolean") {
    params.set("onlyAvailable", String(options.onlyAvailable));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchStations(lat, lng, options = {}) {
  const response = await fetch(buildApiUrl(`/api/stations${buildLocationQuery(lat, lng, options)}`));
  if (!response.ok) {
    throw new Error("Failed to fetch stations");
  }
  return response.json();
}

export async function updateStock(id, available, trigger) {
  const response = await fetch(buildApiUrl("/api/update-stock"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id, available, trigger })
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Failed to update stock");
  }

  return response.json();
}

export async function fetchStationInsights(lat, lng, options = {}) {
  const response = await fetch(buildApiUrl(`/api/station-insights${buildLocationQuery(lat, lng, options)}`));
  if (!response.ok) {
    throw new Error("Failed to fetch station insights");
  }
  return response.json();
}

export async function fetchAlerts(since) {
  const query = typeof since === "number" ? `?since=${since}` : "";
  const response = await fetch(buildApiUrl(`/api/alerts${query}`));

  if (!response.ok) {
    throw new Error("Failed to fetch alerts");
  }

  return response.json();
}

export async function fetchHistory() {
  const response = await fetch(buildApiUrl("/api/history"));
  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }
  return response.json();
}

export async function fetchPriceAlerts() {
  const response = await fetch(buildApiUrl("/api/price-alerts"));
  if (!response.ok) {
    throw new Error("Failed to fetch price alerts");
  }
  return response.json();
}

export async function fetchMapFeed(lat, lng, options = {}) {
  const response = await fetch(buildApiUrl(`/api/map-feed${buildLocationQuery(lat, lng, options)}`));
  if (!response.ok) {
    throw new Error("Failed to fetch map feed");
  }
  return response.json();
}

export async function fetchNearbyStations(lat, lng, options = {}) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radiusKm: String(options.radiusKm ?? 25),
    onlyAvailable: String(Boolean(options.onlyAvailable))
  });

  const response = await fetch(buildApiUrl(`/api/nearby-stations?${params.toString()}`));
  if (!response.ok) {
    throw new Error("Failed to fetch nearby stations");
  }
  return response.json();
}

export async function simulateTick() {
  const response = await fetch(buildApiUrl("/api/simulate-tick"), {
    method: "POST"
  });

  if (!response.ok) {
    throw new Error("Failed to simulate realtime tick");
  }

  return response.json();
}
