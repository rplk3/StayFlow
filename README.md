# Performance Analytics Module — Hotel Booking & Management System

## Component 03 — Progress 1: Database First + Connected APIs

### Tech Stack
- **Backend:** Node.js + Express + MongoDB Atlas (Mongoose)
- **Frontend:** React + Vite + Tailwind CSS + Recharts + lucide-react
- **Reports PDF:** pdfkit (server-side)
- **Forecasting:** Baseline (30-day moving average) — ML model training planned for Progress 2

---

## Getting Started

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://hotelAdmin:<password>@cluster0.nbmg6tk.mongodb.net/?appName=Cluster0
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 3 room types (Standard=20, Deluxe=10, Suite=5 rooms)
- 150+ bookings across 60 days
- Payments with realistic refund distribution
- Pre-aggregated daily analytics
- Sample alerts

### 4. Start Backend

```bash
cd backend
npm start
```

Server runs on `http://localhost:5000`

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## API Endpoints

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analytics/rebuild-daily` | Aggregate last 60 days into AnalyticsDaily |
| GET | `/api/analytics/dashboard?from=&to=` | Dashboard summary + chart series |
| GET | `/api/analytics/forecast?days=7` | Baseline forecast for next N days |
| POST | `/api/analytics/check-anomalies` | Run rule-based anomaly detection |
| GET | `/api/analytics/alerts?status=ACTIVE` | List alerts (filter by status) |
| PATCH | `/api/analytics/alerts/:id/resolve` | Resolve an alert |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reports/generate` | Generate report data (JSON preview) |
| GET | `/api/reports/pdf?type=&from=&to=` | Download PDF report |

### Sample curl Commands

```bash
# Rebuild daily analytics
curl -X POST http://localhost:5000/api/analytics/rebuild-daily

# Dashboard
curl "http://localhost:5000/api/analytics/dashboard?from=2026-01-01&to=2026-03-04"

# Forecast
curl "http://localhost:5000/api/analytics/forecast?days=7"

# Check anomalies
curl -X POST http://localhost:5000/api/analytics/check-anomalies

# Alerts
curl "http://localhost:5000/api/analytics/alerts?status=ACTIVE"

# Generate report (JSON)
curl -X POST http://localhost:5000/api/reports/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"revenue","from":"2026-01-01","to":"2026-03-04"}'

# Download PDF
curl "http://localhost:5000/api/reports/pdf?type=revenue&from=2026-01-01&to=2026-03-04" -o report.pdf
```

---

## Project Structure

```
backend/
├── .env
├── package.json
└── src/
    ├── config/db.js
    ├── models/
    │   ├── Alert.js
    │   ├── AnalyticsDaily.js
    │   ├── Booking.js
    │   ├── Payment.js
    │   └── Room.js
    ├── services/
    │   ├── analyticsService.js
    │   ├── forecastingService.js
    │   ├── anomalyService.js
    │   └── reportService.js
    ├── controllers/
    │   ├── analyticsController.js
    │   └── reportController.js
    ├── routes/
    │   ├── analyticsRoutes.js
    │   └── reportRoutes.js
    ├── seed/seed.js
    ├── app.js
    └── server.js

frontend/
└── src/
    ├── components/
    │   ├── AlertsList.jsx
    │   ├── ChartsSection.jsx
    │   ├── Sidebar.jsx
    │   ├── StatsCard.jsx
    │   └── Topbar.jsx
    ├── pages/
    │   ├── Alerts.jsx
    │   ├── Dashboard.jsx
    │   ├── Forecasting.jsx
    │   └── Reports.jsx
    ├── services/api.js
    ├── App.jsx
    ├── index.css
    └── main.jsx
```

---

## ML / Forecasting Notes

> **Baseline forecasting implemented now.**
> Regression/ML model training is planned for the next milestone (Progress 2/Final).

The `forecastingService.js` is designed so that the ML model can be swapped in by replacing `getBaselineForecast()` with an ML inference function. The service exports the same array format regardless of method.
