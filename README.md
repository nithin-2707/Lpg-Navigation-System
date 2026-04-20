# LPG Navigation System (Real Data Mode)

A full-stack web application that helps drivers find nearby fuel stations using live location and real POI station data from OpenStreetMap services.

## What This Project Now Does

- Uses browser GPS to detect your location.
- Fetches nearby real station records (name, address, coordinates, brand/operator where available).
- Shows nearby stations on:
  - Dashboard
  - Station Map
  - Live Nearby Stations (renamed from Price Alerts)
  - Supply History (repurposed to real station listing)
- Uses a real map background (Leaflet + OpenStreetMap).
- Shows branded marker badges in Dashboard map panel (IOCL, BPCL, HP, JIO, OTR fallback).

## Important Real-Data Note

This project uses real station-location POI data, but it does **not** provide official real-time petrol/diesel prices per station from a commercial pricing feed.

Because of that, the app is in **honest real-data mode**:

- No fake stock toggles
- No fake simulated alerts/log timelines
- No fake per-station fuel price simulation

## Tech Stack

### Frontend
- React 18
- Vite 5
- Leaflet + react-leaflet
- Custom CSS

### Backend
- Node.js
- Express 4
- Helmet
- Morgan
- CORS

### Data Source
- OpenStreetMap-based geocoding/POI service (Photon)

## Current Pages

1. Dashboard
- Current selected nearby station summary.
- Real map background in live panel with brand markers.
- Compact top nearby station preview.
- "View All Nearby Stations" navigation button.

2. Station Map
- Full interactive map with nearby stations and user location marker.
- Opens navigation route in Google Maps.

3. Live Nearby Stations
- Full table/list page of nearby real stations.
- No fake price columns.
- Manual refresh button for live data pull.

4. Supply History
- Repurposed for real nearby station listing in real-data mode.

## API Endpoints

Base URL (local): `http://localhost:5000`

Also available with `/api` prefix.

### Read endpoints
- `GET /stations`
- `GET /nearby-stations?lat=..&lng=..&radiusKm=..&limit=..`
- `GET /station-insights`
- `GET /map-feed`
- `GET /alerts` (empty in real-data mode)
- `GET /history` (empty in real-data mode)
- `GET /price-alerts` (empty in real-data mode)

### Non-read endpoints in real-data mode
- `POST /update-stock` -> returns `405` (read-only mode)
- `POST /simulate-tick` -> returns informational response (no fake simulation)

## Local Development

### 1) Install dependencies

```bash
npm install
```

### 2) Start backend

```bash
cd backend
npm install
npm start
```

### 3) Start frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend default: `http://localhost:5173`
Backend default: `http://localhost:5000`

## Deployment (Vercel)

This repository is configured for Vercel deployment from the repo root.

Typical settings used:

- Root Directory: `.`
- Install Command: `npm install --include=dev --include=optional`
- Build Command: `npm install --prefix frontend @rollup/rollup-linux-x64-gnu --no-save && npm run build`
- Output Directory: `frontend/dist`

## Project Structure

```text
Lpg-Navigation-System/
├── api/
│   └── index.js
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── controllers/
│   │   │   └── stationController.js
│   │   ├── routes/
│   │   │   └── stationRoutes.js
│   │   ├── services/
│   │   │   └── stationService.js
│   │   └── server.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── components/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── StationMapPage.jsx
│   │   │   ├── PriceAlertsPage.jsx
│   │   │   └── SupplyHistoryPage.jsx
│   │   └── styles.css
│   └── package.json
├── package.json
├── vercel.json
└── README.md
```

## Future Improvements

- Integrate a real commercial fuel price feed for true station-wise petrol/diesel prices.
- Add persistent data storage and user roles.
- Add caching and retry logic for external data providers.
- Add fallback providers when one POI source is rate-limited.
