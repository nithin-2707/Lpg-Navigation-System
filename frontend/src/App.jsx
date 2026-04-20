import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchAlerts,
  fetchHistory,
  fetchMapFeed,
  fetchNearbyStations,
  fetchPriceAlerts,
  fetchStationInsights,
  fetchStations,
  simulateTick,
  updateStock
} from "./api";
import DashboardPage from "./components/DashboardPage";
import PriceAlertsPage from "./components/PriceAlertsPage";
import StationMapPage from "./components/StationMapPage";
import SupplyHistoryPage from "./components/SupplyHistoryPage";

const STATION_REFRESH_INTERVAL_MS = 5000;
const ALERT_REFRESH_INTERVAL_MS = 4000;
const FEED_REFRESH_INTERVAL_MS = 5500;
const SIMULATION_INTERVAL_MS = 12000;
const NEARBY_RADIUS_KM = 60;
const NAV_ITEMS = ["Dashboard", "Station Map", "Price Alerts", "Supply History"];

function App() {
  const [stations, setStations] = useState([]);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [selectedStationId, setSelectedStationId] = useState(1);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [mapFeed, setMapFeed] = useState([]);
  const [stationInsights, setStationInsights] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [nearbyStations, setNearbyStations] = useState([]);
  const [onlyNearbyAvailable, setOnlyNearbyAvailable] = useState(false);
  const lastAlertCheckRef = useRef(Date.now());
  const locationWatchIdRef = useRef(null);

  const selectedStation = useMemo(() => {
    if (stationInsights.length === 0) {
      return null;
    }

    return (
      stationInsights.find((station) => station.id === selectedStationId) ||
      stationInsights[0]
    );
  }, [stationInsights, selectedStationId]);

  const availableCount = useMemo(() => {
    return stations.filter((station) => station.available).length;
  }, [stations]);

  const subscribedUsers = useMemo(() => {
    return 1000 + availableCount * 71;
  }, [availableCount]);

  const supplyStations = useMemo(() => {
    if (userLocation && nearbyStations.length > 0) {
      return nearbyStations;
    }
    return stationInsights;
  }, [userLocation, nearbyStations, stationInsights]);

  async function loadNearbyStations(lat, lng, onlyAvailable = onlyNearbyAvailable) {
    try {
      const data = await fetchNearbyStations(lat, lng, {
        radiusKm: NEARBY_RADIUS_KM,
        onlyAvailable
      });
      setNearbyStations(data);
    } catch (err) {
      setLocationError(err.message);
    }
  }

  function requestLiveLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserLocation(nextLocation);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocationError("Location permission denied. Enable GPS to find nearest stations.");
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000
      }
    );
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }

    locationWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationError("");
      },
      () => {
        setLocationError("Unable to track live location. Using last known location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000
      }
    );

    return () => {
      if (locationWatchIdRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchIdRef.current);
      }
    };
  }, []);

  async function loadStations() {
    try {
      const data = await fetchStations();
      setStations(data);
      if (!data.some((station) => station.id === selectedStationId) && data[0]) {
        setSelectedStationId(data[0].id);
      }
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadInsights() {
    try {
      const data = await fetchStationInsights();
      setStationInsights(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadMapAndFeeds() {
    try {
      const [mapData, historyData, priceData] = await Promise.all([
        fetchMapFeed(),
        fetchHistory(),
        fetchPriceAlerts()
      ]);
      setMapFeed(mapData);
      setHistory(historyData);
      setPriceAlerts(priceData);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleStockUpdate(id, available) {
    try {
      setLoadingUpdate(true);
      await updateStock(id, available, "Manual Toggle (Admin)");
      await Promise.all([loadStations(), loadInsights(), loadMapAndFeeds()]);
      if (userLocation) {
        await loadNearbyStations(userLocation.latitude, userLocation.longitude);
      }
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingUpdate(false);
    }
  }

  useEffect(() => {
    loadStations();
    loadInsights();
    loadMapAndFeeds();
    requestLiveLocation();

    const intervalId = setInterval(() => {
      loadStations();
      loadInsights();
    }, STATION_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!userLocation) {
      return;
    }

    loadNearbyStations(userLocation.latitude, userLocation.longitude, onlyNearbyAvailable);

    const intervalId = setInterval(() => {
      loadNearbyStations(userLocation.latitude, userLocation.longitude, onlyNearbyAvailable);
    }, FEED_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [userLocation, onlyNearbyAvailable]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadMapAndFeeds();
    }, FEED_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    async function pollAlerts() {
      try {
        const data = await fetchAlerts(lastAlertCheckRef.current);

        if (Array.isArray(data) && data.length > 0) {
          setAlerts((previous) => [...data, ...previous].slice(0, 8));
        }

        lastAlertCheckRef.current = Date.now();
      } catch (err) {
        setError(err.message);
      }
    }

    pollAlerts();
    const intervalId = setInterval(() => {
      pollAlerts();
    }, ALERT_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        await simulateTick();
        await Promise.all([loadStations(), loadInsights(), loadMapAndFeeds()]);
        if (userLocation) {
          await loadNearbyStations(userLocation.latitude, userLocation.longitude);
        }
      } catch (err) {
        setError(err.message);
      }
    }, SIMULATION_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  async function handleSimulateTick() {
    try {
      await simulateTick();
      await Promise.all([loadStations(), loadInsights(), loadMapAndFeeds()]);
      if (userLocation) {
        await loadNearbyStations(userLocation.latitude, userLocation.longitude);
      }
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleQuickToggle() {
    if (!selectedStation) {
      return;
    }

    await handleStockUpdate(selectedStation.id, !selectedStation.available);
  }

  function renderActivePage() {
    if (activeNav === "Station Map") {
      return (
        <StationMapPage
          mapFeed={mapFeed}
          selectedStationId={selectedStationId}
          onSelectStation={setSelectedStationId}
          selectedStation={selectedStation}
          userLocation={userLocation}
          locationError={locationError}
          locating={locating}
          onRequestLocation={requestLiveLocation}
          nearbyStations={nearbyStations}
        />
      );
    }

    if (activeNav === "Price Alerts") {
      return (
        <PriceAlertsPage
          priceAlerts={priceAlerts}
          onSimulateTick={handleSimulateTick}
        />
      );
    }

    if (activeNav === "Supply History") {
      return (
        <SupplyHistoryPage
          history={history}
          stations={supplyStations}
          isNearbyMode={Boolean(userLocation && nearbyStations.length > 0)}
          onUpdateStock={handleStockUpdate}
          onSimulateTick={handleSimulateTick}
        />
      );
    }

    return (
      <DashboardPage
        selectedStation={selectedStation}
        subscribedUsers={subscribedUsers}
        loadingUpdate={loadingUpdate}
        onQuickToggle={handleQuickToggle}
        mapFeed={mapFeed}
        onSelectStation={setSelectedStationId}
        alerts={alerts}
        history={history}
        userLocation={userLocation}
        locationError={locationError}
        locating={locating}
        onRequestLocation={requestLiveLocation}
        nearbyStations={nearbyStations}
        onlyNearbyAvailable={onlyNearbyAvailable}
        onToggleNearbyAvailable={() => setOnlyNearbyAvailable((value) => !value)}
      />
    );
  }

  return (
    <div className="control-layout">
      <aside className="left-rail">
        <h1>LPG Navigator</h1>
        <p>Premium Instrumentation</p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item}
            className={item === activeNav ? "rail-item active" : "rail-item"}
            onClick={() => setActiveNav(item)}
          >
            {item}
          </button>
        ))}
        <button className="rail-item rail-bottom">Account Settings</button>
      </aside>

      <main className="main-surface">
        <header className="top-nav">
          <nav>
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                className={item === activeNav ? "top-link active" : "top-link"}
                onClick={() => setActiveNav(item)}
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="top-actions">
            <span className="icon-bubble">!</span>
            <span className="avatar">ND</span>
          </div>
        </header>

        {error && <p className="error-banner">{error}</p>}
        {renderActivePage()}
      </main>
    </div>
  );
}

export default App;
