import { useMemo, useState } from "react";

function StockUpdater({ stations, onUpdate, loading }) {
  const [selectedId, setSelectedId] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("true");

  const canSubmit = useMemo(() => {
    return selectedId !== "" && !loading;
  }, [selectedId, loading]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    onUpdate(Number(selectedId), selectedAvailability === "true");
  }

  return (
    <form className="stock-form" onSubmit={handleSubmit}>
      <h2>Simulate Stock Update</h2>
      <div className="stock-form-controls">
        <label>
          Station
          <select
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            <option value="">Select a station</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Availability
          <select
            value={selectedAvailability}
            onChange={(event) => setSelectedAvailability(event.target.value)}
          >
            <option value="true">Available</option>
            <option value="false">Not Available</option>
          </select>
        </label>

        <button type="submit" disabled={!canSubmit}>
          {loading ? "Updating..." : "Update Stock"}
        </button>
      </div>
    </form>
  );
}

export default StockUpdater;
