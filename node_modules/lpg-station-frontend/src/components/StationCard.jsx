function StationCard({ station }) {
  const statusText = station.available ? "Available" : "Not Available";

  return (
    <article className="station-card">
      <header className="station-card-header">
        <h3>{station.name}</h3>
        <span
          className={`status-pill ${station.available ? "available" : "unavailable"}`}
        >
          {statusText}
        </span>
      </header>
      <p className="station-location">{station.location}</p>
    </article>
  );
}

export default StationCard;
