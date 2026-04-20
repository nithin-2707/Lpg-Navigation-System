function AlertsPanel({ alerts }) {
  if (alerts.length === 0) {
    return (
      <aside className="alerts-panel">
        <h2>Availability Alerts</h2>
        <p className="alerts-empty">No new alerts yet.</p>
      </aside>
    );
  }

  return (
    <aside className="alerts-panel">
      <h2>Availability Alerts</h2>
      <ul>
        {alerts.map((alert) => (
          <li key={alert.id}>
            <strong>{alert.stationName}</strong> became available at{" "}
            {new Date(alert.becameAvailableAt).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default AlertsPanel;
