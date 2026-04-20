function PriceAlertsPage({ priceAlerts, nearbyStations, userLocation, onSimulateTick }) {
  const visibleNearbyStations = nearbyStations.slice(0, 6);

  return (
    <section className="page-panel">
      <div className="page-head">
        <h2>Price Alerts</h2>
        <p>Real-time fuel price movement (petrol and diesel per litre).</p>
      </div>

      <article className="widget">
        <div className="activity-head">
          <h3>Current Nearby Prices</h3>
        </div>

        <table className="price-table">
          <thead>
            <tr>
              <th>Station</th>
              <th>Distance</th>
              <th>Petrol</th>
              <th>Diesel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleNearbyStations.map((station) => (
              <tr key={`nearby-${station.id}`}>
                <td>{station.name}</td>
                <td>{station.distanceKm.toFixed(2)} km</td>
                <td>Rs.{station.petrolPrice.toFixed(2)}/L</td>
                <td>Rs.{station.dieselPrice.toFixed(2)}/L</td>
                <td className={station.available ? "ok" : "no"}>
                  {station.available ? "Available" : "Not Available"}
                </td>
              </tr>
            ))}
            {visibleNearbyStations.length === 0 && (
              <tr>
                <td colSpan="5">
                  {userLocation
                    ? "No nearby stations found yet. Use current location and try again."
                    : "Enable location to see current nearby station prices."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </article>

      <article className="widget">
        <div className="activity-head">
          <h3>{userLocation ? "Live Price Feed (Nearby)" : "Live Price Feed"}</h3>
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
                <td colSpan="6">
                  {userLocation
                    ? "No nearby price alerts yet. Trigger a realtime tick to generate local movement."
                    : "No fuel price alerts yet. Trigger a simulation tick."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </article>
    </section>
  );
}

export default PriceAlertsPage;
