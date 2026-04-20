import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function DashboardPage({
  selectedStation,
  subscribedUsers,
  mapFeed,
  alerts,
  history,
  userLocation,
  locationError,
  locating,
  onRequestLocation,
  nearbyStations,
  onOpenNearbyPage,
}) {
  const mapStations = (nearbyStations.length > 0 ? nearbyStations : mapFeed).slice(0, 14);
  const compactNearbyStations = nearbyStations.slice(0, 4);

  const mapCenter = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : selectedStation
      ? [selectedStation.latitude, selectedStation.longitude]
      : [16.4876, 80.5015];

  const userLocationIcon = new L.DivIcon({
    className: "user-location-marker",
    html: '<span class="pulse"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });

  function getBrandCode(station) {
    const source = `${station.brand || ""} ${station.operator || ""} ${station.name || ""}`.toLowerCase();
    if (source.includes("indian oil") || source.includes("ioc") || source.includes("iocl")) return "IOCL";
    if (source.includes("bharat") || source.includes("bpcl")) return "BPCL";
    if (source.includes("hp") || source.includes("hpcl") || source.includes("hindustan")) return "HP";
    if (source.includes("jio") || source.includes("reliance")) return "JIO";
    return "OTR";
  }

  function getBrandClass(station) {
    const code = getBrandCode(station);
    if (code === "IOCL") return "iocl";
    if (code === "BPCL") return "bpcl";
    if (code === "HP") return "hp";
    if (code === "JIO") return "jio";
    return "otr";
  }

  function buildBrandIcon(station) {
    const code = getBrandCode(station);
    const brandClass = getBrandClass(station);
    return new L.DivIcon({
      className: `dashboard-brand-pin dashboard-brand-pin-${brandClass}`,
      html: `<span>${code}</span>`,
      iconSize: [48, 24],
      iconAnchor: [24, 12]
    });
  }

  return (
    <>
      <section className="hero-row">
        <article className="status-card">
          <p className="meta">Current Live Station</p>
          <h2>{selectedStation?.name || "Waiting for location"}</h2>
          {selectedStation ? (
            <>
              <p className="fuel-price-line">
                {selectedStation.location || selectedStation.city || selectedStation.state || "Live station data from OpenStreetMap"}
              </p>
              <p className="broadcast-dot">
                <span /> Live station data loaded from OpenStreetMap / Photon
              </p>
              <p className="mode-note">
                {selectedStation.brand || selectedStation.operator || selectedStation.source || "Real POI data"}
              </p>
            </>
          ) : (
            <p className="mode-note">Enable location to load nearby real stations.</p>
          )}
          <button className="wide-pill" onClick={onRequestLocation}>
            {locating ? "Locating..." : "Use Current Location"}
          </button>
        </article>

        <article className="metric-card">
          <p className="metric-icon">Users</p>
          <h3>{subscribedUsers.toLocaleString()}</h3>
          <p>Subscribed users awaiting immediate status notification.</p>
          <small>Demand Index: High Volatility</small>
        </article>
      </section>

      <section className="board-grid">
        <article className="map-stage">
          <p className="meta">Live System Status: Real Data</p>
          <div className="leaflet-shell dashboard-map-shell">
            <MapContainer
              center={mapCenter}
              zoom={11}
              className="leaflet-map dashboard-mini-map"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mapStations.map((station) => (
                <Marker
                  key={station.id}
                  position={[station.latitude, station.longitude]}
                  icon={buildBrandIcon(station)}
                >
                  <Popup>
                    <strong>{station.name}</strong>
                    <br />
                    {station.location || [station.city, station.state].filter(Boolean).join(", ")}
                  </Popup>
                </Marker>
              ))}

              {userLocation && (
                <Marker
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={userLocationIcon}
                >
                  <Popup>Your current location</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          <div className="mode-note">Brand markers represent nearby station operators (IOCL, HP, BPCL, JIO).</div>
          {mapStations.length === 0 && (
            <p className="mode-note map-empty-note">No live nearby stations loaded yet.</p>
          )}
          <div className="activity-head">
            <button className="quiet-action" onClick={onOpenNearbyPage}>
              View All Nearby Stations
            </button>
          </div>
        </article>

        <aside className="intel-panel">
          <h3>Live Data</h3>
          <p>Nearby real station records</p>
          <ul>
            {alerts.slice(0, 3).map((item) => (
              <li key={item.id}>
                <strong>{item.stationName}</strong>
                <span>{item.note || "Live data feed"}</span>
              </li>
            ))}
            {alerts.length === 0 && (
              <li>
                <strong>No simulated alerts</strong>
                <span>Real data mode does not generate fake alerts.</span>
              </li>
            )}
          </ul>
          <button className="wide-pill">Manage Filters</button>
        </aside>
      </section>

      <section className="nearby-panel">
        <div className="activity-head">
          <h3>Nearby Fuel Stations (Live Location)</h3>
          <div className="nearby-actions">
            <button className="quiet-action" onClick={onOpenNearbyPage}>
              View All Nearby Stations
            </button>
            <button className="wide-pill" onClick={onRequestLocation}>
              {locating ? "Locating..." : "Use Current Location"}
            </button>
          </div>
        </div>
        {userLocation && (
          <p className="live-location-text">
            Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </p>
        )}
        {locationError && <p className="live-location-error">{locationError}</p>}
        <div className="nearby-list">
          {compactNearbyStations.map((station) => (
            <button key={station.id} className="nearby-item">
              <strong>{station.name}</strong>
              <span>{station.location || [station.city, station.state].filter(Boolean).join(", ")}</span>
              <span>{station.distanceKm.toFixed(2)} km away</span>
              <span>{station.brand || station.operator || "OpenStreetMap"}</span>
            </button>
          ))}
          {nearbyStations.length > 4 && (
            <p className="mode-note">Showing top 4 nearby stations. Tap "View All Nearby Stations" for full list.</p>
          )}
          {compactNearbyStations.length === 0 && (
            <p>No stations found in 60 km radius. Showing closest options when available.</p>
          )}
        </div>
      </section>

      <section className="activity-panel">
        <div className="activity-head">
          <h3>Recent Activity</h3>
          <button className="quiet-action">Export Logs</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Time & Date</th>
              <th>Status</th>
              <th>Source</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 5).map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.timestamp).toLocaleString()}</td>
                <td>Live data only</td>
                <td>OpenStreetMap</td>
                <td>{row.note || "No simulated history in real-data mode."}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan="4">No simulated activity. Real-data mode does not create fake logs.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

export default DashboardPage;
