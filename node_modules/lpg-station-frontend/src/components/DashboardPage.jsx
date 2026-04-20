function DashboardPage({
  selectedStation,
  subscribedUsers,
  loadingUpdate,
  onQuickToggle,
  mapFeed,
  onSelectStation,
  alerts,
  history,
  userLocation,
  locationError,
  locating,
  onRequestLocation,
  nearbyStations,
  onlyNearbyAvailable,
  onToggleNearbyAvailable
}) {
  return (
    <>
      <section className="hero-row">
        <article className="status-card">
          <p className="meta">Current Instrument Status</p>
          <h2>{selectedStation?.available ? "Available" : "Not Available"}</h2>
          {selectedStation && (
            <p className="fuel-price-line">
              Petrol: Rs.{selectedStation.petrolPrice.toFixed(2)}/L | Diesel: Rs.{selectedStation.dieselPrice.toFixed(2)}/L
            </p>
          )}
          <p className="broadcast-dot">
            <span /> Broadcasting live status to network
          </p>
          <button
            className="switch-control"
            onClick={onQuickToggle}
            disabled={loadingUpdate || !selectedStation}
          >
            <span className="toggle-track" aria-hidden="true">
              <span className={selectedStation?.available ? "knob on" : "knob"} />
            </span>
            <span className="switch-label">{loadingUpdate ? "Updating..." : "Tap to Toggle"}</span>
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
          <p className="meta">Live System Status: Active</p>
          <div className="map-grid-overlay">
            {mapFeed.map((point) => (
              <button
                key={point.id}
                className={point.available ? "map-dot on" : "map-dot off"}
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                onClick={() => onSelectStation(point.id)}
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
          <h3>Intelligence</h3>
          <p>Real-time supply alerts</p>
          <ul>
            {alerts.slice(0, 3).map((item) => (
              <li key={item.id}>
                <strong>{item.stationName}</strong>
                <span>
                  Available at {new Date(item.becameAvailableAt).toLocaleTimeString()}
                </span>
              </li>
            ))}
            {alerts.length === 0 && (
              <li>
                <strong>No urgent alerts</strong>
                <span>System is stable for now.</span>
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
            <button className="quiet-action" onClick={onToggleNearbyAvailable}>
              {onlyNearbyAvailable ? "Show All Nearby" : "Only Available"}
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
          {nearbyStations.map((station) => (
            <button
              key={station.id}
              className="nearby-item"
              onClick={() => onSelectStation(station.id)}
            >
              <strong>{station.name}</strong>
              <span>{station.city}, {station.state}</span>
              <span>{station.distanceKm.toFixed(2)} km away</span>
              <span className={station.available ? "ok" : "no"}>
                {station.available ? "Available" : "Not Available"}
              </span>
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
              <th>Action</th>
              <th>Triggered By</th>
              <th>Reach</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 5).map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.timestamp).toLocaleString()}</td>
                <td>
                  <span className={row.action === "Available" ? "dot on" : "dot off"} />
                  {row.action}
                </td>
                <td>{row.trigger}</td>
                <td>{row.reach}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan="4">No activity yet. Trigger an update to create logs.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
}

export default DashboardPage;
