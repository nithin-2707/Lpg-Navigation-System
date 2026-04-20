import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

const userLocationIcon = new L.DivIcon({
  className: "user-location-marker",
  html: '<span class="pulse"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

function StationMapPage({
  mapFeed,
  selectedStationId,
  onSelectStation,
  selectedStation,
  userLocation,
  locationError,
  locating,
  onRequestLocation,
  nearbyStations
}) {
  const mapPoints = userLocation && nearbyStations.length > 0 ? nearbyStations : mapFeed;

  const mapCenter = userLocation
    ? { lat: userLocation.latitude, lng: userLocation.longitude }
    : selectedStation
      ? { lat: selectedStation.latitude, lng: selectedStation.longitude }
      : { lat: 20.5937, lng: 78.9629 };

  const selectedMapPoint = mapPoints.find((point) => point.id === selectedStationId);

  return (
    <section className="page-panel">
      <div className="page-head">
        <h2>Station Map</h2>
        <p>OpenStreetMap view with live station pins and nearby routing support.</p>
      </div>

      <div className="map-page-grid">
        <article className="map-stage full-height">
          <p className="meta">
            {userLocation && nearbyStations.length > 0
              ? "Showing nearby stations from your live location"
              : "Showing all configured stations in India"}
          </p>

          <div className="leaflet-shell">
            <MapContainer
              center={mapCenter}
              zoom={selectedMapPoint ? 11 : 5}
              className="leaflet-map"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mapPoints.map((point) => (
                <Marker
                  key={point.id}
                  position={[point.latitude, point.longitude]}
                  eventHandlers={{
                    click: () => onSelectStation(point.id)
                  }}
                >
                  <Popup>
                    <strong>{point.name}</strong>
                    <br />
                    {point.available ? "Available" : "Not Available"}
                  </Popup>
                </Marker>
              ))}

              {userLocation && (
                <Marker
                  position={[userLocation.latitude, userLocation.longitude]}
                  icon={userLocationIcon}
                >
                  <Popup>Your current location</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          <p className="mode-note">Map tiles powered by OpenStreetMap (no API key required).</p>
        </article>

        <aside className="widget">
          <h4>Selected Station</h4>
          <p>{selectedStation?.name || "No station selected"}</p>
          <p>{selectedStation?.location || "Select one from the map"}</p>
          {selectedStation && (
            <p>
              Petrol Rs.{selectedStation.petrolPrice.toFixed(2)}/L | Diesel Rs.{selectedStation.dieselPrice.toFixed(2)}/L
            </p>
          )}
          {selectedStation && (
            <a
              className="nav-link"
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStation.latitude},${selectedStation.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              Navigate in Google Maps
            </a>
          )}
          <div className="selection-state">
            <span className={selectedStation?.available ? "ok" : "no"}>
              {selectedStation?.available ? "Available" : "Not Available"}
            </span>
            <small>ID: {selectedStationId}</small>
          </div>
          <button className="wide-pill" onClick={onRequestLocation}>
            {locating ? "Locating..." : "Find Nearby from My Location"}
          </button>
          {userLocation && (
            <p className="live-location-text">
              Current: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </p>
          )}
          {locationError && <p className="live-location-error">{locationError}</p>}
          <div className="nearby-inline-list">
            {nearbyStations.slice(0, 4).map((item) => (
              <button
                key={item.id}
                className="nearby-item compact"
                onClick={() => onSelectStation(item.id)}
              >
                <strong>{item.name}</strong>
                <span>{item.distanceKm.toFixed(2)} km</span>
              </button>
            ))}
            {nearbyStations.length === 0 && <p>No nearby stations yet.</p>}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default StationMapPage;
