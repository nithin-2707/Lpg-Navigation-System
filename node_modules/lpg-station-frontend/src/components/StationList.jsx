import StationCard from "./StationCard";

function StationList({ stations }) {
  if (stations.length === 0) {
    return <p className="empty-state">No stations match the current filter.</p>;
  }

  return (
    <section className="station-grid">
      {stations.map((station) => (
        <StationCard key={station.id} station={station} />
      ))}
    </section>
  );
}

export default StationList;
