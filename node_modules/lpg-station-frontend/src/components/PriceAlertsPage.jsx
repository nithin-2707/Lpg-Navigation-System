function PriceAlertsPage({ priceAlerts, onSimulateTick }) {
  return (
    <section className="page-panel">
      <div className="page-head">
        <h2>Price Alerts</h2>
        <p>Real-time fuel price movement (petrol and diesel per litre).</p>
      </div>

      <article className="widget">
        <div className="activity-head">
          <h3>Live Price Feed</h3>
          <button className="wide-pill" onClick={onSimulateTick}>
            Trigger Realtime Tick
          </button>
        </div>

        <table className="price-table">
          <thead>
            <tr>
              <th>Station</th>
              <th>Fuel</th>
              <th>Previous</th>
              <th>Current</th>
              <th>Delta</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {priceAlerts.slice(0, 12).map((item) => (
              <tr key={item.id}>
                <td>{item.stationName}</td>
                <td>{item.fuelType ? item.fuelType.toUpperCase() : "PETROL"}</td>
                <td>Rs.{item.previousPrice.toFixed(2)}/L</td>
                <td>Rs.{item.currentPrice.toFixed(2)}/L</td>
                <td className={item.delta >= 0 ? "no" : "ok"}>
                  {item.delta >= 0 ? "+" : ""}
                  {item.delta.toFixed(2)}
                </td>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {priceAlerts.length === 0 && (
              <tr>
                <td colSpan="6">No fuel price alerts yet. Trigger a simulation tick.</td>
              </tr>
            )}
          </tbody>
        </table>
      </article>
    </section>
  );
}

export default PriceAlertsPage;
