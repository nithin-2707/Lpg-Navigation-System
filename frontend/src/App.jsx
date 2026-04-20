import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchAlerts,
  fetchHistory,
  fetchMapFeed,
  fetchNearbyStations,
  fetchStationInsights,
  fetchStations,
  simulateTick,
} from "./api";
import DashboardPage from "./components/DashboardPage";
import PriceAlertsPage from "./components/PriceAlertsPage";
import StationMapPage from "./components/StationMapPage";
import SupplyHistoryPage from "./components/SupplyHistoryPage";

const STATION_REFRESH_INTERVAL_MS = 5000;
const ALERT_REFRESH_INTERVAL_MS = 4000;
const FEED_REFRESH_INTERVAL_MS = 5500;
const NEARBY_RADIUS_KM = 60;
const DEFAULT_LOCATION = { latitude: 16.4876, longitude: 80.5015 };
const NAV_ITEMS = ["Dashboard", "Station Map", "Live Nearby Stations", "Supply History"];

function App() {
  const [stations, setStations] = useState([]);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [mapFeed, setMapFeed] = useState([]);
  const [stationInsights, setStationInsights] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [nearbyStations, setNearbyStations] = useState([]);
  const lastAlertCheckRef = useRef(Date.now());
  const locationWatchIdRef = useRef(null);

  const activeLocation = userLocation || DEFAULT_LOCATION;

  const selectedStation = useMemo(() => {
    if (stationInsights.length === 0) {
      return null;
    }

    return stationInsights[0];
  }, [stationInsights]);

  const availableCount = useMemo(() => {
    return stations.length;
  }, [stations]);

  const subscribedUsers = useMemo(() => {
    return 1000 + availableCount * 53;
  }, [availableCount]);

  const supplyStations = useMemo(() => {
    if (userLocation && nearbyStations.length > 0) {
      return nearbyStations;
    }
    return stationInsights;
  }, [userLocation, nearbyStations, stationInsights]);

  async function loadNearbyStations(lat, lng) {
    try {
      const data = await fetchNearbyStations(lat, lng, {
        radiusKm: NEARBY_RADIUS_KM,
        onlyAvailable: false
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
      const data = await fetchStations(activeLocation.latitude, activeLocation.longitude, {
        radiusKm: NEARBY_RADIUS_KM
      });
      setStations(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadInsights() {
    try {
      const data = await fetchStationInsights(activeLocation.latitude, activeLocation.longitude, {
        radiusKm: NEARBY_RADIUS_KM
      });
      setStationInsights(data);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadMapAndFeeds() {
    try {
      const [mapData, historyData] = await Promise.all([
        fetchMapFeed(activeLocation.latitude, activeLocation.longitude, {
          radiusKm: NEARBY_RADIUS_KM
        }),
        fetchHistory()
      ]);
      setMapFeed(mapData);
      setHistory(historyData);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    requestLiveLocation();
  }, []);

  useEffect(() => {
    loadStations();
    loadInsights();
    loadMapAndFeeds();

    const intervalId = setInterval(() => {
      loadStations();
      loadInsights();
    }, STATION_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [activeLocation.latitude, activeLocation.longitude]);

  useEffect(() => {
    if (!userLocation) {
      return;
    }

    loadNearbyStations(userLocation.latitude, userLocation.longitude);

    const intervalId = setInterval(() => {
      loadNearbyStations(userLocation.latitude, userLocation.longitude);
    }, FEED_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [userLocation]);

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

  async function handleRefreshLiveData() {
    await Promise.resolve(simulateTick());
    await Promise.all([loadStations(), loadInsights(), loadMapAndFeeds()]);
  }

  function renderActivePage() {
    if (activeNav === "Station Map") {
      return (
        <StationMapPage
          mapFeed={mapFeed}
          selectedStation={selectedStation}
          userLocation={userLocation}
          locationError={locationError}
          locating={locating}
          onRequestLocation={requestLiveLocation}
          nearbyStations={nearbyStations}
        />
      );
    }

    if (activeNav === "Live Nearby Stations") {
      return (
        <PriceAlertsPage
          stations={supplyStations}
          nearbyStations={nearbyStations}
          userLocation={userLocation}
          onRefreshLiveData={handleRefreshLiveData}
        />
      );
    }

    if (activeNav === "Supply History") {
      return (
        <SupplyHistoryPage
          stations={supplyStations}
          isNearbyMode={Boolean(userLocation && nearbyStations.length > 0)}
        />
      );
    }

    return (
      <DashboardPage
        selectedStation={selectedStation}
        subscribedUsers={subscribedUsers}
        mapFeed={mapFeed}
        userLocation={userLocation}
        locationError={locationError}
        locating={locating}
        onRequestLocation={requestLiveLocation}
        nearbyStations={nearbyStations}
        alerts={alerts}
        history={history}
        onOpenNearbyPage={() => setActiveNav("Live Nearby Stations")}
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
