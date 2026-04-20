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
}) {
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
          <div className="map-grid-overlay">
            {mapFeed.map((point) => (
              <button
                key={point.id}
                className="map-dot on"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                title={point.name}
              />
            ))}
          </div>
          <div className="map-controls">
            <button>+</button>
            <button>-</button>
            <button>o</button>
          </div>
        </article>

        <aside className="intel-panel">
          <h3>Live Data</h3>
          <p>Nearby real station records</p>
          <ul>
            {alerts.slice(0, 3).map((item) => (
              <li key={item.id}>
                <strong>{item.stationName}</strong>
                <span>
                  {item.note || "Live data feed"}
                </span>
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
          <button className="wide-pill" onClick={onRequestLocation}>
            {locating ? "Locating..." : "Use Current Location"}
          </button>
        </div>
        {userLocation && (
          <p className="live-location-text">
            Your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </p>
        )}
        {locationError && <p className="live-location-error">{locationError}</p>}
        <div className="nearby-list">
          {nearbyStations.map((station) => (
            <button
              key={station.id}
              className="nearby-item"
            >
              <strong>{station.name}</strong>
              <span>{station.location || [station.city, station.state].filter(Boolean).join(", ")}</span>
              <span>{station.distanceKm.toFixed(2)} km away</span>
              <span>{station.brand || station.operator || "OpenStreetMap"}</span>
            </button>
          ))}
          {nearbyStations.length === 0 && (
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
