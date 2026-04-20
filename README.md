# Fuel Station Finder MVP

A full-stack MVP web app to help auto drivers find nearby fuel stations with live availability.

## Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Data: In-memory JSON (MVP)

## Features
- List all fuel stations
- Availability status with color badges
- Filter only available stations near current location
- Simulate stock updates from UI
- Polling for near real-time station updates
- Optional alert feed when stations become available
- Live-location nearby search using browser GPS (India)
- Fuel pricing as per-litre rates (petrol and diesel)
- Functional multi-page dashboard:
  - Dashboard
  - Station Map
  - Price Alerts
  - Supply History
- Auto simulation ticks for live MVP behavior

## Backend
Base URL: `http://localhost:5000`

Endpoints:
- `GET /stations` -> all stations
- `POST /update-stock` -> update station availability
- `GET /alerts` -> optional availability alerts
- `GET /history` -> stock change timeline/logs
- `GET /price-alerts` -> petrol/diesel price movement feed
- `GET /map-feed` -> map markers with live availability
- `GET /station-insights` -> station metrics (petrol/diesel/auto-LPG, capacity, hours)
- `GET /nearby-stations?lat=..&lng=..&radiusKm=..&onlyAvailable=..` -> nearest stations from user location
- `POST /simulate-tick` -> triggers one realtime simulation cycle

Compatible namespaced endpoints are also available:
- `GET /api/stations`
- `POST /api/update-stock`
- `GET /api/alerts`
- `GET /api/history`
- `GET /api/price-alerts`
- `GET /api/map-feed`
- `GET /api/station-insights`
- `GET /api/nearby-stations`
- `POST /api/simulate-tick`

Request payload for stock update:
```json
{
  "id": 2,
  "available": true
}
```

## Run Locally
### 1) Start Backend
```powershell
cd backend
npm install
npm start
```

### 2) Start Frontend
Open a second terminal:
```powershell
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API requests to backend.

### Maps Setup (No API Key Needed)
Station Map uses OpenStreetMap tiles via Leaflet, so no API key, billing, or card details are required.

### Nearby Station Behavior
- When location permission is enabled, Supply History and Station Map prefer nearby stations first.
- If nearby data is unavailable, the app falls back to all configured stations in India.

## Deployment (Single Service)
This project is deployment-ready as one service.

1. Build frontend:
```powershell
cd frontend
npm install
npm run build
```

2. Start backend in production mode (serves API + built frontend):
```powershell
cd ../backend
npm install
$env:NODE_ENV="production"
npm start
```

Open `http://localhost:5000`.

Optional environment variable for split deployments:
- Frontend can use `VITE_API_BASE_URL`.

### Vercel Deployment
This repo is also Vercel-ready from the root folder.

1. Push the root repo to GitHub.
2. Import the repo into Vercel.
3. Use the root directory as the project root.
4. Leave `VITE_API_BASE_URL` empty for same-domain API calls, or set it if you split backend later.

The Vercel config serves the frontend build and exposes the Express backend as a serverless API at `/api/*`.

## Production Build
Frontend:
```powershell
cd frontend
npm run build
npm run preview
```

Backend:
```powershell
cd backend
npm start
```

## Notes
- Data is in-memory for MVP, so restarting backend resets station stock and alerts.
- Authentication is intentionally not included as requested.
