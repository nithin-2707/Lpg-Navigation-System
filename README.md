# LPG Navigation System - Fuel Station Finder MVP

A full-stack progressive web application designed to help auto drivers efficiently locate nearby LPG fuel stations with real-time availability status. The app combines geolocation technology, live inventory tracking, and an intuitive dashboard to simplify fuel procurement decisions on the road.

## 🎯 Project Overview

**LPG Navigation System** is a mobile-first MVP that addresses the critical pain point of fuel availability discovery for auto drivers in India. With real-time station inventory updates, location-based discovery, and multi-page analytics, drivers can make informed fueling decisions instantly.

### Key Highlights
- **Zero API Keys**: Uses free OpenStreetMap tiles—no Google Maps billing required
- **Real-time Simulation**: Automatic stock ticks simulate live fuel availability changes
- **GPS-Based Discovery**: Browser geolocation integration for nearby station ranking
- **Multi-page Dashboard**: Dashboard, Station Map, Price Alerts, and Supply History
- **Per-Litre Pricing**: Transparent petrol/diesel fuel cost per liter
- **Production Ready**: Deployment-ready for Vercel with serverless architecture

---

## 🏗 Tech Stack

### Frontend
- **React 18** – UI component framework
- **Vite 5** – Fast build tool with HMR
- **Leaflet + OpenStreetMap** – Free mapping library (no API key required)
- **CSS3** – Custom responsive styling with dark theme

### Backend
- **Node.js** – JavaScript runtime
- **Express 4** – RESTful API framework
- **Helmet** – HTTP security middleware
- **Morgan** – Request logging
- **serverless-http** – Vercel serverless adapter

### Data
- **In-Memory JSON** – Fast MVP data store (resets on deploy)

---

## ✨ Features

### 🚗 Core Functionality
- **Station Listing** – Browse all configured fuel stations with availability badges
- **Real-Time Updates** – Polling mechanism (every 5s) for near-instant stock changes
- **Live Geolocation** – Browser GPS integration to find stations near current location
- **Availability Filtering** – Toggle to show only available stations
- **Stock Simulation** – Manual UI controls + auto ticks to simulate real stock changes

### 📊 Dashboard Pages

| Page | Purpose |
|------|---------|
| **Dashboard** | Main status view with quick metrics and toggle controls |
| **Station Map** | Interactive map with station pins, user location, and navigation links |
| **Price Alerts** | Fuel price movement feed (petrol/diesel per liter) |
| **Supply History** | Detailed log of stock updates with timestamps and status changes |

### 🔔 Advanced Features
- **Nearby Station Ranking** – Haversine distance calculation for accurate proximity ranking
- **Optional Alerts** – Feed for when stations transition to "available" status
- **Station Insights** – Metrics on capacity, hours, and fuel types per station
- **Multi-Fuel Support** – Petrol, Diesel, and Auto-LPG inventory tracking
- **Dark Theme UI** – Eye-friendly interface optimized for low-light driving scenarios

---

## 📡 API Reference

### Base URL
- **Local Dev**: `http://localhost:5000`
- **Namespaced (Optional)**: `http://localhost:5000/api/*`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stations` | List all stations with current inventory |
| `POST` | `/update-stock` | Update availability for a specific station |
| `GET` | `/alerts` | Fetch availability alerts feed |
| `GET` | `/history` | Retrieve stock change timeline |
| `GET` | `/price-alerts` | Get fuel price movement data |
| `GET` | `/map-feed` | Retrieve map markers with live status |
| `GET` | `/station-insights` | Station metrics (capacity, hours, fuel types) |
| `GET` | `/nearby-stations` | Find stations by GPS coordinates |
| `POST` | `/simulate-tick` | Trigger one realtime simulation cycle |

### Query Parameters

**Nearby Stations:**
```
GET /nearby-stations?lat=15.8&lng=78.4&radiusKm=10&onlyAvailable=true
```
- `lat` (number) – User latitude
- `lng` (number) – User longitude
- `radiusKm` (number) – Search radius in kilometers
- `onlyAvailable` (boolean) – Filter only available stations

**Stock Update:**
```
POST /update-stock
Content-Type: application/json

{
  "id": 2,
  "available": true
}
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Modern browser with geolocation support

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/nithin-2707/Lpg-Navigation-System.git
cd Lpg-Navigation-System
```

**2. Start the backend**
```bash
cd backend
npm install
npm start
```
Backend runs on `http://localhost:5000`

**3. Start the frontend (new terminal)**
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

**4. Grant location permission** when prompted by the browser

---

## 🗺 Maps & Geolocation

### Why Free Maps?
This app uses **OpenStreetMap tiles** via the **Leaflet** library—no API key, billing, or credit card required. This keeps the app lightweight and cost-free for small-scale deployments.

### Geolocation Behavior
- On app load, the browser requests location permission
- If granted, stations are ranked by Haversine distance from your current position
- Nearby stations appear first in Supply History and Station Map
- If permission is denied, the app shows all configured stations (India-focused)

---

**Build & Run**
```bash
npm run build
NODE_ENV=production npm start
```
Runs on `http://localhost:5000` with bundled frontend.

---

## ⚙️ Project Structure

```
Lpg-Navigation-System/
├── frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx             # Main app orchestration
│   │   ├── api.js              # REST client
│   │   ├── components/         # Dashboard, Map, History, Alerts pages
│   │   ├── styles.css          # Dark theme + responsive design
│   │   └── main.jsx            # React entry point
│   ├── package.json
│   └── vite.config.js
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── app.js              # Express middleware & routes setup
│   │   ├── server.js           # Server startup
│   │   ├── routes/
│   │   │   └── stationRoutes.js
│   │   ├── controllers/
│   │   │   └── stationController.js
│   │   ├── services/
│   │   │   └── stationService.js   # Core business logic
│   │   └── data/
│   │       └── stations.js     # Station seed data
│   └── package.json
├── api/                         # Vercel serverless entry
│   └── index.js                # serverless-http wrapper
├── package.json                # Root workspace config
├── vercel.json                 # Vercel routing & build config
└── README.md                   # This file
```

---

## 🔄 Real-Time Behavior

### How It Works
1. **Frontend Polling** – Every 5 seconds, the app requests updated station data
2. **Backend Simulation** – Optional `/simulate-tick` endpoint randomly updates stock
3. **Event Logging** – All changes logged in Supply History with timestamps
4. **Alert Feed** – When a station transitions to "available", it's logged in the alerts feed

### Example Flow
```
User clicks "Simulate"
  ↓
POST /api/simulate-tick triggered
  ↓
Backend randomly updates 1-3 station availabilities
  ↓
Frontend polls /api/stations every 5s
  ↓
Updated data displayed in Dashboard + History
  ↓
Price changes reflected in Price Alerts page
```

---

## 🎨 UI/UX Features

- **Responsive Design** – Mobile-first layout that works on phones, tablets, desktops
- **Accessibility** – Semantic HTML, ARIA labels, keyboard navigation
- **Performance** – Vite optimizations, lazy component loading, efficient polling
- **Dark Theme** – Reduces eye strain for drivers using the app at night
- **Loading States** – Clear visual feedback during API calls
- **Error Handling** – Graceful fallbacks when geolocation or APIs fail

---

## 🔐 Security & Best Practices

- **Helmet.js** – Secure HTTP headers
- **CORS** – Properly configured for production
- **Environment Variables** – Sensitive data protected (`.env` in gitignore)
- **Input Validation** – All API inputs validated server-side
- **Error Messages** – Generic responses prevent information leakage

---

## 📈 Future Enhancements

- [ ] **PostgreSQL Integration** – Persistent data across deployments
- [ ] **User Authentication** – Per-driver profiles and preferences
- [ ] **Real API Integration** – Connect to actual fuel station networks
- [ ] **Push Notifications** – Alerts when nearby stations become available
- [ ] **Analytics Dashboard** – Track usage patterns and popular stations
- [ ] **Offline Mode** – Cache stations and work without internet
- [ ] **Multi-Language Support** – Regional language interfaces

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🤝 Support

For issues, feature requests, or questions:
- Open an issue on [GitHub Issues](https://github.com/nithin-2707/Lpg-Navigation-System/issues)
- Check existing documentation in [API Reference](#-api-reference)

---

## ⚡ Quick Commands

```bash
# Development
npm run dev              # Start both frontend & backend (from root)
npm start               # Start backend only

# Production
npm run build           # Build frontend for production
NODE_ENV=production npm start  # Run backend in production

# Git & Deployment
git push origin main    # Push to GitHub
# Then import to Vercel dashboard
```

---

**Built with ❤️ for auto drivers in India** 🚗

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
