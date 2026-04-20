function PriceAlertsPage({ stations, nearbyStations, userLocation, onRefreshLiveData }) {
  const visibleNearbyStations = (nearbyStations.length > 0 ? nearbyStations : stations).slice(0, 8);

  return (
    <section className="page-panel">
      <div className="page-head">
        <h2>Live Nearby Stations</h2>
        <p>Fully real-data mode using nearby station records from OpenStreetMap.</p>
      </div>

      <article className="widget">
        <div className="activity-head">
          <h3>Nearby Fuel Stations</h3>
        </div>

        <table className="price-table">
          <thead>
            <tr>
              <th>Station</th>
              <th>Distance</th>
              <th>Location</th>
              <th>Brand / Operator</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {visibleNearbyStations.map((station) => (
              <tr key={`nearby-${station.id}`}>
                <td>{station.name}</td>
                <td>{station.distanceKm.toFixed(2)} km</td>
                <td>{station.location || [station.city, station.state].filter(Boolean).join(", ")}</td>
                <td>{station.brand || station.operator || "OpenStreetMap"}</td>
                <td>{station.phone || station.openingHours || "No live contact info"}</td>
              </tr>
            ))}
            {visibleNearbyStations.length === 0 && (
              <tr>
                <td colSpan="5">
                  {userLocation
                    ? "No nearby stations found yet. Use current location and try again."
                    : "Enable location to see current nearby station data."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </article>

      <article className="widget">
        <div className="activity-head">
          <h3>{userLocation ? "Live Station Feed (Nearby)" : "Live Station Feed"}</h3>
          <button className="wide-pill" onClick={onRefreshLiveData}>
            Refresh Live Data
          </button>
        </div>

        <table className="price-table">
          <thead>
            <tr>
              <th>Station</th>
              <th>Address</th>
              <th>Hours</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {visibleNearbyStations.slice(0, 12).map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.location || [item.city, item.state].filter(Boolean).join(", ")}</td>
                <td>{item.openingHours || "Not listed"}</td>
                <td>{item.source || "OpenStreetMap"}</td>
              </tr>
            ))}
            {visibleNearbyStations.length === 0 && (
              <tr>
                <td colSpan="4">
                  {userLocation
                    ? "No nearby station data yet. Trigger a refresh or re-enable location."
                    : "No station data yet. Enable location to load live data."}
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
