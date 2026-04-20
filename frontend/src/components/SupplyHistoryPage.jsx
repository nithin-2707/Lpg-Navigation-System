function SupplyHistoryPage({ stations, isNearbyMode }) {
  return (
    <section className="page-panel">
      <div className="page-head">
        <h2>Supply History</h2>
        <p>Real nearby station list. Live-data mode does not keep fake operational history.</p>
      </div>

      <article className="widget">
        <div className="activity-head">
          <h3>Nearby Stations</h3>
        </div>
        <p className="mode-note">
          {isNearbyMode
            ? "Showing nearby stations based on your current location."
            : "Showing real station data near the default live region."}
        </p>

        <div className="action-grid">
          {stations.map((station) => (
            <div className="action-card" key={station.id}>
              <h4>{station.name}</h4>
              <p>{station.location || [station.city, station.state].filter(Boolean).join(", ")}</p>
              <span className="ok">{station.brand || station.operator || station.source || "OpenStreetMap"}</span>
            </div>
          ))}
        </div>

        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Station</th>
                <th>Brand / Operator</th>
                <th>Location</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {stations.slice(0, 15).map((station) => (
                <tr key={station.id}>
                  <td>
                    <strong className="history-station">{station.name}</strong>
                  </td>
                  <td>{station.brand || station.operator || "Live station"}</td>
                  <td>{station.location || [station.city, station.state].filter(Boolean).join(", ")}</td>
                  <td>{station.source || "OpenStreetMap"}</td>
                </tr>
              ))}
              {stations.length === 0 && (
                <tr>
                  <td colSpan="4">No station data yet. Enable location to load live data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default SupplyHistoryPage;
