function SupplyHistoryPage({ history, stations, isNearbyMode, onUpdateStock, onSimulateTick }) {
  function getTriggerLabel(trigger) {
    if (trigger === "Automatic Supply Monitor") {
      return "Auto Monitor";
    }
    if (trigger === "Manual Toggle (Admin)") {
      return "Manual (Admin)";
    }
    return trigger;
  }

  return (
    <section className="page-panel">
      <div className="page-head">
        <h2>Supply History</h2>
        <p>Track operational changes and quickly perform stock actions.</p>
      </div>

      <article className="widget">
        <div className="activity-head">
          <h3>Control Actions</h3>
          <button className="wide-pill" onClick={onSimulateTick}>
            Run Auto Monitor Tick
          </button>
        </div>
        <p className="mode-note">
          {isNearbyMode
            ? "Showing nearby stations based on your current location."
            : "Showing all configured stations across India."}
        </p>

        <div className="action-grid">
          {stations.map((station) => (
            <div className="action-card" key={station.id}>
              <h4>{station.name}</h4>
              <p>{station.location}</p>
              <span className={station.available ? "ok" : "no"}>
                {station.available ? "Available" : "Not Available"}
              </span>
              <div className="action-row">
                <button className="quiet-action" onClick={() => onUpdateStock(station.id, true)}>
                  Mark Available
                </button>
                <button className="quiet-action" onClick={() => onUpdateStock(station.id, false)}>
                  Mark Unavailable
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Station</th>
                <th>Status</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 15).map((row) => {
                const eventDate = new Date(row.timestamp);

                return (
                  <tr key={row.id}>
                    <td>
                      <div className="history-time">
                        <strong>{eventDate.toLocaleTimeString()}</strong>
                        <small>{eventDate.toLocaleDateString()}</small>
                      </div>
                    </td>
                    <td>
                      <strong className="history-station">{row.stationName}</strong>
                    </td>
                    <td>
                      <span className={row.action === "Available" ? "status-badge on" : "status-badge off"}>
                        <span className={row.action === "Available" ? "dot on" : "dot off"} />
                        {row.action}
                      </span>
                    </td>
                    <td>
                      <span className="trigger-chip">{getTriggerLabel(row.trigger)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}

export default SupplyHistoryPage;
