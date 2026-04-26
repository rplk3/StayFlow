# Performance Analytics & Hotel Management System

A full-stack MERN application that provides comprehensive hotel and event hall booking management alongside an advanced Performance Analytics dashboard.

## Overview
This system is designed to handle room reservations, event hall bookings, staff and transport management, and administrative billing. The key feature is the **Performance Analytics** module, which processes daily booking and revenue data to generate smart UI dashboards, forecast future trends, and run anomaly detection for revenue leaks or booking abnormalities. 

## Key Features

### 📊 Performance Analytics
*   **Daily Aggregation**: Automatically calculates daily occupancy rates, revenue, and bookings across both hotel and event channels.
*   **Trend Forecasting**: Uses simple moving averages combined with simulated variance to predict forward-looking revenue and occupancy trends.
*   **Smart Alerts (Anomaly Detection):** Rule-based continuous monitoring that flashes active dashboard alerts for:
    *   *Revenue Leaks:* Flags days where requested refunds exceed a high threshold.
    *   *Revenue Drops:* Flags a sudden severe drop in revenue against a 30-day average constraint.
    *   *High Cancellations:* Detects unusual spikes in daily customer cancellations.
*   **Detailed Reporting**: Ability to export key analytic metrics to PDF.

### 🏨 Core Booking System
*   **Hotel Booking Flow**: Search available rooms, date-pickers, and secure checkout. 
*   **Event Hall Management**: Comprehensive CRUD interfaces for event halls with integrated booking flows.
*   **Interactive Maps**: Uses Leaflet for rendering geospatial data to users.
*   **AI Conversational BI**: Integrates `@google/genai` inside the backend for an intelligent query capability. 

### ⚙️ User Management & Security
*   **Role Based Access Control (RBAC)**: Distinct permissions separating standard customers and internal administrators.
*   **JWT & bcryptjs**: Secure authentication, authorization, and password handling. 
*   **SweetAlert2 UI**: Clean, animated validation and interaction responses across all modules.

---

## Technology Stack

### Frontend
*   **Framework**: React (v19) via Vite
*   **Styling**: Tailwind CSS
*   **Routing**: React Router DOM
*   **Charts & Visualization**: Recharts
*   **Icons & Assets**: Lucide React
*   **Mapping**: React Leaflet
*   **PDF Generation**: jsPDF + jsPDF-AutoTable

### Backend
*   **Environment**: Node.js & Express
*   **Database**: MongoDB (via Mongoose)
*   **Authentication**: JSON Web Token (JWT)
*   **AI Integrations**: Google GenAI (`@google/genai`)
*   **PDF Exports**: PDFKit

---

## Project Structure
The repository is split into independent `frontend` and `backend` services. 

```
/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── performanceAnalytics/  # Analytics logic, forecasts, alerts
│   │   │   ├── eventHall/             # Event hall business logic
│   │   │   ├── hotelRoom/             # Booking business logic
│   │   │   └── payment/               # Transactional logic
│   │   ├── server.js                  # Express Entrypoint
│   │   └── seed/                      # Database Mock Data injection
│   ├── .env                           # Backend environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/                # Reusable UI widgets
    │   ├── modules/                   
    │   │   └── performanceAnalytics/  # Admin analytics views & charts
    │   ├── pages/                     # Core App Pages (Admin, Auth, Landing)
    │   └── App.jsx
    └── package.json
```

---

## Installation & Setup

### Prerequisites
*   Node.js (v18 or higher recommended)
*   MongoDB Instance (Local or Atlas)
*   Google Gemini API Key (if utilizing conversational functionality)

### 1. Initialize Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file referencing the needed keys (e.g. `PORT`, `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`).
4. (Optional) Run the database seed if starting fresh:
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Initialize Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`. 
