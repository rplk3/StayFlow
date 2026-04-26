# 🚐 GuestGo — Hotel Transport Management System

A fullstack web application for managing hotel guest transportation. It enables **guests** to book rides, **drivers** to manage their trips, and **admins** to oversee all operations — bookings, drivers, vehicles, and approvals — from a unified dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Seeding the Database](#seeding-the-database)
- [User Roles & Portals](#user-roles--portals)
- [API Reference](#api-reference)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Frontend Details](#frontend-details)
- [Key Features](#key-features)
- [Merging into Main Project](#merging-into-main-project)

---

## Overview

GuestGo is a **hotel transport booking and management system** with three distinct user portals:

| Portal | URL | Description |
|--------|-----|-------------|
| **Guest Portal** | `/` (root) | Guests register/login, book transport, and track active trips |
| **Driver Portal** | `/driver` | Drivers self-register, login after approval, and manage assigned trips |
| **Admin Dashboard** | `/admin` | Admins manage bookings, drivers, vehicles, and approve driver registrations |

---

## Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | REST API server |
| **MongoDB + Mongoose** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **nodemailer** | Email notifications (optional) |
| **nodemon** | Dev server with hot-reload |
| **dotenv** | Environment variable management |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** (TypeScript) | UI framework |
| **Vite 6** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **TanStack React Query** | Server state management & caching |
| **Zustand** | Client state management (auth stores) |
| **Axios** | HTTP client |
| **TailwindCSS 3** | Utility-first CSS framework |
| **Lucide React** | Icon library |
| **React Hook Form + Zod** | Form handling & validation |
| **clsx + tailwind-merge** | Conditional class utilities |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Vite + React)            │
│                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Guest   │  │   Driver     │  │    Admin      │  │
│  │  Portal  │  │   Portal     │  │   Dashboard   │  │
│  └────┬─────┘  └──────┬───────┘  └───────┬───────┘  │
│       │               │                  │           │
│  ┌────┴───────────────┴──────────────────┴────┐      │
│  │         Axios API Client (lib/api.ts)       │      │
│  │         Zustand Stores (auth/app)           │      │
│  └─────────────────────┬───────────────────────┘      │
└────────────────────────┼──────────────────────────────┘
                         │ HTTP (port 5173 → 5001)
┌────────────────────────┼──────────────────────────────┐
│                   BACKEND (Express)                    │
│                        │                               │
│  ┌─────────────────────┴──────────────────────────┐   │
│  │              Express Router                     │   │
│  │  /api/auth        → Guest register/login        │   │
│  │  /api/driver-auth → Driver register/login       │   │
│  │  /api/bookings    → CRUD + assign + status      │   │
│  │  /api/drivers     → CRUD + approve/reject       │   │
│  │  /api/vehicles    → CRUD + location update      │   │
│  │  /api/health      → Health check                │   │
│  └─────────────────────┬──────────────────────────┘   │
│                        │                               │
│  ┌─────────────────────┴──────────────────────────┐   │
│  │         Mongoose Models (MongoDB)               │   │
│  │  Guest | Driver | Booking | Vehicle             │   │
│  └────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
hotel-transport-app/
├── backend/
│   ├── .env                          # Backend environment variables
│   ├── package.json                  # Backend dependencies & scripts
│   ├── seed.js                       # Database seeder (10 drivers, 10 vehicles, 6 bookings)
│   └── src/
│       ├── server.js                 # Express app entry point (port 5001)
│       ├── config/
│       │   └── db.js                 # MongoDB connection (Mongoose)
│       ├── middleware/
│       │   ├── auth.js               # JWT middleware for Guest routes
│       │   └── driverAuth.js         # JWT middleware for Driver routes
│       ├── models/
│       │   ├── Booking.js            # Booking schema (guest, pickup/drop, status, refs)
│       │   ├── Driver.js             # Driver schema (auth, vehicle info, approval status)
│       │   ├── Guest.js              # Guest schema (auth, room, phone)
│       │   └── Vehicle.js            # Vehicle schema (type, capacity, location, status)
│       ├── routes/
│       │   ├── auth.js               # POST /register, /login, GET /profile (Guest)
│       │   ├── driverAuth.js         # POST /register, /login, GET /profile, /my-bookings
│       │   ├── bookings.js           # Full CRUD + /assign + /status
│       │   ├── drivers.js            # CRUD + /pending, /approve, /reject
│       │   └── vehicles.js           # CRUD + PATCH /location
│       ├── controllers/              # (empty — logic is in route files)
│       └── utils/                    # (empty — reserved for helpers)
│
├── frontend/
│   ├── .env                          # Frontend env (VITE_API_URL)
│   ├── package.json                  # Frontend dependencies & scripts
│   ├── index.html                    # HTML entry point
│   ├── vite.config.ts                # Vite config (React SWC plugin, @ alias)
│   ├── tsconfig.json                 # TypeScript config
│   ├── tailwind.config.js            # TailwindCSS config
│   ├── postcss.config.js             # PostCSS config (Tailwind + Autoprefixer)
│   └── src/
│       ├── main.tsx                  # React entry (QueryClientProvider + App)
│       ├── App.tsx                   # Router: Guest, Driver, Admin routes
│       ├── index.css                 # Global styles (Tailwind directives + custom)
│       ├── vite-env.d.ts             # Vite type declarations
│       │
│       ├── types/
│       │   └── index.ts              # All TypeScript interfaces (Booking, Driver, etc.)
│       │
│       ├── lib/
│       │   ├── api.ts                # Axios instance + all API functions
│       │   └── utils.ts              # Utility helpers (e.g. cn for classnames)
│       │
│       ├── store/
│       │   ├── authStore.ts          # Zustand store — Guest auth (persisted)
│       │   ├── driverAuthStore.ts    # Zustand store — Driver auth (persisted)
│       │   └── appStore.ts           # Zustand store — global app data (bookings/drivers/vehicles)
│       │
│       ├── hooks/
│       │   ├── useBookings.ts        # React Query hooks for booking operations
│       │   ├── useDrivers.ts         # React Query hooks for driver operations
│       │   └── useVehicles.ts        # React Query hooks for vehicle operations
│       │
│       ├── components/
│       │   ├── ui/                   # Reusable UI primitives
│       │   │   ├── button.tsx
│       │   │   ├── dialog.tsx
│       │   │   ├── form.tsx
│       │   │   ├── input.tsx
│       │   │   ├── select.tsx
│       │   │   └── table.tsx
│       │   ├── layout/               # Layout components (empty)
│       │   ├── AssignmentForm.tsx     # Assign driver + vehicle to booking
│       │   ├── BookingCard.tsx        # Booking display card
│       │   ├── DriverForm.tsx         # Driver add/edit form
│       │   ├── LocationAutocomplete.tsx  # Location search with autocomplete
│       │   └── VehicleForm.tsx        # Vehicle add/edit form
│       │
│       ├── features/
│       │   ├── bookings/             # Booking feature module
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   └── types.ts
│       │   ├── drivers/              # Driver feature module (empty)
│       │   └── vehicles/             # Vehicle feature module (empty)
│       │
│       └── pages/
│           ├── NotFound.tsx           # 404 page
│           ├── Guest/
│           │   ├── LoginPage.tsx      # Guest login
│           │   ├── RegisterPage.tsx   # Guest registration
│           │   ├── BookingPage.tsx     # Guest dashboard (book rides, view trips)
│           │   └── components/
│           │       ├── BookingForm.tsx        # Full booking form
│           │       ├── ActiveTripWidget.tsx   # Live trip status tracker
│           │       ├── GuestSidebar.tsx       # Guest navigation sidebar
│           │       └── GuestTopbar.tsx        # Guest top navigation bar
│           │
│           ├── Driver/
│           │   ├── DriverLoginPage.tsx     # Driver login
│           │   ├── DriverRegisterPage.tsx  # Driver self-registration (with vehicle info)
│           │   └── DriverDashboard.tsx     # Driver dashboard (view/manage trips)
│           │
│           └── Admin/
│               ├── Dashboard.tsx          # Main admin dashboard (tabbed interface)
│               ├── DriversList.tsx         # Drivers list view
│               ├── VehiclesList.tsx        # Vehicles list view
│               ├── components/
│               │   ├── AdminSidebar.tsx    # Admin sidebar navigation
│               │   └── AdminTopbar.tsx     # Admin top bar
│               └── views/
│                   ├── OverviewPanel.tsx   # Dashboard overview with stats
│                   ├── BookingsPanel.tsx   # Bookings management
│                   ├── DriversPanel.tsx    # Drivers management
│                   ├── VehiclesPanel.tsx   # Vehicles management
│                   ├── ApprovalsPanel.tsx  # Pending driver approvals
│                   └── ReportsPanel.tsx    # Reports (placeholder)
```

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| **Node.js** | v18 or higher |
| **npm** | v9 or higher |
| **MongoDB** | v6+ (local install or MongoDB Atlas) |

---

## Installation & Setup

### 1. Clone / Copy the Project

```bash
git clone <your-repo-url>
cd hotel-transport-app
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/transport-db
JWT_SECRET=guestgo_secret_key
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your-app-password
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 5001) |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | No | JWT signing secret (falls back to `guestgo_secret_key`) |
| `EMAIL_USER` | No | Gmail address for email notifications |
| `EMAIL_PASS` | No | Gmail App Password ([how to generate](https://support.google.com/accounts/answer/185833)) |

> **Note:** Email notifications are optional. The app works fully without `EMAIL_USER`/`EMAIL_PASS`. They're only used to send booking confirmation and trip completion emails.

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5001/api
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | **Yes** | Backend API base URL |

---

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
npm run dev
```

The backend starts on **http://localhost:5001** with nodemon (auto-reloads on file changes).

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The frontend starts on **http://localhost:5173** (Vite dev server).

### Build Frontend for Production

```bash
cd frontend
npm run build
```

Output is generated to `frontend/dist/`.

---

## Seeding the Database

Populate the database with sample data (10 drivers, 10 vehicles, 6 pending bookings):

```bash
cd backend
node seed.js
```

The seeder is **idempotent** — it only inserts data if the collections are empty. Running it again when data exists will be skipped with a log message.

### Sample Data Included

| Collection | Count | Details |
|------------|-------|---------|
| **Drivers** | 10 | Pre-approved, password: `password123` |
| **Vehicles** | 10 | Sedans, SUVs, Minivans, Vans, Buses |
| **Bookings** | 6 | All with `Pending` status, Sri Lankan locations |

---

## User Roles & Portals

### 👤 Guest Portal (`/login` → `/`)

| Feature | Description |
|---------|-------------|
| Register | Name, email, password, phone, room number |
| Login | Email + password → JWT token |
| Book Transport | Pickup/drop-off, date/time, vehicle type, passenger count |
| Track Trip | View active trip status in real-time |
| View History | See all past bookings |

### 🚗 Driver Portal (`/driver/login` → `/driver`)

| Feature | Description |
|---------|-------------|
| Self-Register | Personal info, license, vehicle details |
| Await Approval | Must be approved by admin before login |
| View Assigned Trips | See bookings assigned by admin |
| Update Trip Status | Mark trips as `On the Way` → `Completed` |
| Auto-Resource Release | Completing a trip frees the driver & vehicle |

### ⚙️ Admin Dashboard (`/admin`)

| Feature | Description |
|---------|-------------|
| Overview | Dashboard stats (total bookings, drivers, vehicles) |
| Manage Bookings | View, edit, delete, update status |
| Assign Resources | Assign available driver + vehicle to a booking |
| Manage Drivers | Add, edit, delete drivers |
| Manage Vehicles | Add, edit, delete vehicles; update location |
| Approve Drivers | Review and approve/reject driver registrations |
| Reports | Reports panel (placeholder) |

---

## API Reference

Base URL: `http://localhost:5001/api`

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Returns `{ status: "ok" }` |

### Guest Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ✗ | Register a new guest |
| POST | `/auth/login` | ✗ | Login → returns JWT token |
| GET | `/auth/profile` | ✓ Guest | Get current guest profile |

**Register body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "0771234567",
  "roomNumber": "201"
}
```

### Driver Authentication (`/driver-auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/driver-auth/register` | ✗ | Self-register as driver (status: `pending`) |
| POST | `/driver-auth/login` | ✗ | Login (only if `approved`) |
| GET | `/driver-auth/profile` | ✓ Driver | Get driver profile |
| GET | `/driver-auth/my-bookings` | ✓ Driver | Get bookings assigned to this driver |
| PUT | `/driver-auth/bookings/:id/status` | ✓ Driver | Update trip status (`On the Way` / `Completed`) |

**Register body:**
```json
{
  "name": "Kamal Perera",
  "email": "kamal@example.com",
  "password": "password123",
  "licenseNumber": "DL-2001",
  "contact": "0771001001",
  "nic": "200012345678",
  "address": "123 Main St, Colombo",
  "vehicle": {
    "type": "Sedan",
    "make": "Toyota",
    "model": "Camry",
    "year": 2024,
    "plateNumber": "WP-CAR-2001",
    "capacity": 4,
    "color": "White"
  }
}
```

### Bookings (`/bookings`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bookings` | List all bookings (populated with driver & vehicle) |
| POST | `/bookings` | Create a new booking |
| PUT | `/bookings/:id` | Edit booking details (guest name, locations, time, etc.) |
| PUT | `/bookings/:id/status` | Update status (`Pending` → `Confirmed` → `On the Way` → `Completed` / `Cancelled`) |
| PUT | `/bookings/:id/assign` | Assign a driver + vehicle (sets status to `Confirmed`) |
| DELETE | `/bookings/:id` | Delete booking (frees assigned driver & vehicle) |

**Create booking body:**
```json
{
  "guestName": "Guest A",
  "pickupLocation": "Colombo Fort",
  "dropoffLocation": "Galle Face Hotel",
  "pickupTime": "2026-04-26T10:00:00.000Z",
  "vehicleType": "Sedan",
  "passengerCount": 2,
  "airport": "BIA"
}
```

**Assign body:**
```json
{
  "driverId": "6643abc...",
  "vehicleId": "6643def..."
}
```

### Drivers (`/drivers`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/drivers` | List all **approved** drivers |
| GET | `/drivers/pending` | List all **pending** driver registrations |
| POST | `/drivers` | Admin creates a driver (auto-approved) |
| PUT | `/drivers/:id` | Update driver details |
| PUT | `/drivers/:id/approve` | Approve a driver (also creates Vehicle entry) |
| PUT | `/drivers/:id/reject` | Reject a driver registration |
| DELETE | `/drivers/:id` | Delete a driver |

### Vehicles (`/vehicles`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vehicles` | List all vehicles |
| POST | `/vehicles` | Create a new vehicle |
| PUT | `/vehicles/:id` | Update vehicle details |
| PATCH | `/vehicles/:id/location` | Update vehicle GPS location (lat/lng) |
| DELETE | `/vehicles/:id` | Delete a vehicle |

---

## Database Models

### Guest

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | String | Yes | Trimmed |
| `email` | String | Yes | Unique, lowercase |
| `password` | String | Yes | Min 6 chars, bcrypt hashed |
| `phone` | String | No | Default: `""` |
| `roomNumber` | String | No | Default: `""` |
| `createdAt` | Date | Auto | Mongoose timestamps |

### Driver

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | String | Yes | |
| `email` | String | Yes | Unique, lowercase |
| `password` | String | Yes | Min 6 chars, bcrypt hashed |
| `licenseNumber` | String | Yes | Unique |
| `contact` | String | Yes | |
| `nic` | String | No | National ID |
| `address` | String | No | |
| `availability` | Boolean | No | Default: `true` |
| `status` | String (enum) | No | `pending` / `approved` / `rejected` |
| `vehicle` | Object | No | Embedded: `{ type, make, model, year, plateNumber, capacity, color }` |
| `createdAt` | Date | Auto | Mongoose timestamps |

### Vehicle

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | String | Yes | e.g. Sedan, SUV, Minivan, Coach Bus |
| `make` | String | Yes | e.g. Toyota, Honda |
| `model` | String | Yes | e.g. Camry, CR-V |
| `year` | Number | Yes | |
| `plateNumber` | String | Yes | Unique |
| `capacity` | Number | Yes | Passenger count |
| `status` | String | No | Default: `Available` / `In Use` |
| `latitude` | Number | No | GPS latitude |
| `longitude` | Number | No | GPS longitude |

### Booking

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `guestName` | String | Yes | |
| `pickupLocation` | String | Yes | |
| `dropoffLocation` | String | Yes | |
| `pickupTime` | Date | Yes | |
| `vehicleType` | String | No | Preferred vehicle type |
| `passengerCount` | Number | No | |
| `airport` | String | No | Airport code if applicable |
| `vehicle` | ObjectId | No | Ref → `Vehicle` |
| `driver` | ObjectId | No | Ref → `Driver` |
| `status` | String | No | Default: `Pending` |
| `createdAt` | Date | Auto | Mongoose timestamps |

**Booking Status Flow:**
```
Pending → Confirmed (on assign) → On the Way → Completed
                                              → Cancelled
```

---

## Authentication

The app uses **JWT-based authentication** with two separate auth flows:

### Guest Auth Flow
1. Guest registers → password is bcrypt-hashed → stored in `guests` collection
2. Guest logs in → receives a JWT token (30-day expiry)
3. Token is stored in `localStorage` via Zustand persist (`auth-storage` key)
4. Axios interceptor attaches `Authorization: Bearer <token>` to all requests
5. `protect` middleware verifies token and attaches `req.guest`

### Driver Auth Flow
1. Driver self-registers → status is set to `pending`
2. Admin approves → status becomes `approved`
3. Driver logs in → receives JWT (only if `approved`)
4. Token stored via Zustand persist (`driver-auth-storage` key)
5. `protectDriver` middleware verifies token + checks `status === 'approved'`

### Protected Routes (Frontend)
- `ProtectedRoute` — redirects to `/login` if no guest token
- `ProtectedDriverRoute` — redirects to `/driver/login` if no driver token
- Admin dashboard (`/admin`) is **not protected** (open access)

---

## Frontend Details

### State Management

| Store | File | Persistence | Purpose |
|-------|------|-------------|---------|
| `useAuthStore` | `store/authStore.ts` | `localStorage` (`auth-storage`) | Guest auth state |
| `useDriverAuthStore` | `store/driverAuthStore.ts` | `localStorage` (`driver-auth-storage`) | Driver auth state |
| `useAppStore` | `store/appStore.ts` | None | Bookings, drivers, vehicles data |

### Routing

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/login` | `LoginPage` | No |
| `/register` | `RegisterPage` | No |
| `/` | `BookingPage` (Guest Dashboard) | Guest JWT |
| `/driver/login` | `DriverLoginPage` | No |
| `/driver/register` | `DriverRegisterPage` | No |
| `/driver` | `DriverDashboard` | Driver JWT |
| `/admin` | `AdminDashboard` | No |
| `*` | `NotFound` | No |

### Key UI Components

| Component | Description |
|-----------|-------------|
| `BookingForm` | Multi-step booking form with location autocomplete |
| `LocationAutocomplete` | Location search/suggestion input |
| `AssignmentForm` | Modal to assign driver + vehicle to a booking |
| `ActiveTripWidget` | Real-time trip status tracker for guests |
| `OverviewPanel` | Admin dashboard with aggregate statistics |
| `ApprovalsPanel` | Admin panel to approve/reject driver registrations |

### Build Configuration

- **Bundler:** Vite 6 with `@vitejs/plugin-react-swc` (SWC for fast compilation)
- **Path Alias:** `@` → `./src` (configured in `vite.config.ts`)
- **CSS:** TailwindCSS 3 with PostCSS + Autoprefixer
- **TypeScript:** Strict mode enabled

---

## Key Features

### Booking Lifecycle
1. Guest creates a booking → status: `Pending`
2. Admin assigns an available driver + vehicle → status: `Confirmed`, driver/vehicle marked unavailable
3. Driver marks trip as `On the Way`
4. Driver marks trip as `Completed` → driver & vehicle are auto-released back to available
5. Admin can also cancel bookings at any time

### Driver Approval Workflow
1. Driver submits registration with personal + vehicle details
2. Registration is created with `status: pending`
3. Admin sees pending registrations in the Approvals panel
4. On approval:
   - Driver status → `approved`
   - A `Vehicle` document is auto-created from the driver's embedded vehicle info
   - Driver can now login
5. On rejection: Driver gets a rejection message on login attempt

### Resource Management
- When a driver + vehicle is **assigned** to a booking → both become unavailable
- When a booking is **completed** or **deleted** → driver & vehicle are released
- Admin can only assign **available** drivers and vehicles

### Email Notifications (Optional)
- **On booking confirmation:** Sends driver & vehicle details
- **On trip completion:** Sends completion notice
- Requires valid Gmail + App Password in `.env`

---

## Merging into Main Project

When integrating this module into a larger project, here are the key integration points:

### Backend Files to Merge

| Category | Files | Notes |
|----------|-------|-------|
| **Models** | `models/Booking.js`, `models/Driver.js`, `models/Guest.js`, `models/Vehicle.js` | Core data models |
| **Routes** | `routes/bookings.js`, `routes/drivers.js`, `routes/vehicles.js`, `routes/auth.js`, `routes/driverAuth.js` | Mount under `/api/` |
| **Middleware** | `middleware/auth.js`, `middleware/driverAuth.js` | JWT protection |
| **Config** | `config/db.js` | MongoDB connection |
| **Entry** | `server.js` | Route mounting & CORS |

### Frontend Files to Merge

| Category | Files | Notes |
|----------|-------|-------|
| **Types** | `types/index.ts` | All interfaces |
| **API Layer** | `lib/api.ts` | Axios client + all endpoint functions |
| **Auth Stores** | `store/authStore.ts`, `store/driverAuthStore.ts` | Zustand with persist |
| **App Store** | `store/appStore.ts` | Global data loading |
| **Pages** | `pages/Guest/*`, `pages/Driver/*`, `pages/Admin/*` | All 3 portals |
| **Components** | `components/*` | UI primitives + feature components |
| **Hooks** | `hooks/*` | React Query data hooks |
| **Styles** | `index.css` | Custom styles + Tailwind directives |

### Environment Variables to Add

```env
# Backend
PORT=5001
MONGO_URI=mongodb://localhost:27017/transport-db
JWT_SECRET=your-secret-key
EMAIL_USER=optional@gmail.com
EMAIL_PASS=optional-app-password

# Frontend
VITE_API_URL=http://localhost:5001/api
```

### Dependencies to Install

**Backend:**
```bash
npm install express mongoose cors dotenv jsonwebtoken bcryptjs nodemailer
npm install -D nodemon
```

**Frontend:**
```bash
npm install react react-dom react-router-dom axios zustand @tanstack/react-query react-hook-form @hookform/resolvers zod lucide-react clsx tailwind-merge
npm install -D typescript @types/react @types/react-dom @vitejs/plugin-react-swc vite tailwindcss postcss autoprefixer
```

---

## License

This project is part of the Y2S2 IT coursework.
