import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBooking } from '@/lib/api';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

/* ─── Icons (inline SVG snippets for zero extra deps) ─── */
const CarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v10a2 2 0 0 1-2 2h-2" />
    <circle cx="9" cy="17" r="2" /><circle cx="19" cy="17" r="2" />
  </svg>
);
const DropoffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
  </svg>
);
const TourIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.9a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6.29 6.29l.95-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const RoutesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7H11a3.5 3.5 0 0 1 0-7H17" /><circle cx="18" cy="5" r="3" />
  </svg>
);
const DashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
const HistIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const SupportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="10" r="3" /><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
  </svg>
);
const SettingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M12 2v2M4.93 4.93l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M12 20v2m5.66-2.34l-1.41-1.41" />
  </svg>
);
const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a94b2" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a94b2" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a94b2" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a94b2" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 3a9 9 0 0 1 9 9c0 2.12-.74 4.07-1.97 5.61l1.43 4.28a1 1 0 0 1-1.26 1.26l-4.28-1.43A8.96 8.96 0 0 1 12 21a9 9 0 0 1-9-9 9 9 0 0 1 9-9zM10.5 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm4 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" fill="#fff" />
  </svg>
);
const TaxiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v10a2 2 0 0 1-2 2h-2" />
    <circle cx="9" cy="17" r="2" /><circle cx="19" cy="17" r="2" />
    <path d="M5 5h14v5H5z" />
  </svg>
);
const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#2b3aee">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" stroke="#fff" strokeWidth="2" /><circle cx="12" cy="8" r="1" fill="#fff" />
  </svg>
);
const RouteWindingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
    <path d="M4 19V9a2 2 0 0 1 2-2h12a2 2 0 0 0 2-2V4" />
    <circle cx="4" cy="21" r="2" /><circle cx="20" cy="3" r="2" />
  </svg>
);

/* ─── Schema ─── */
const bookingSchema = z
  .object({
    pickupLocation: z.string().min(1, 'Pickup location is required'),
    destination: z.string().min(1, 'Drop-off location is required'),
    pickupDate: z.string().min(1, 'Date is required'),
    pickupTime: z.string().min(1, 'Time is required'),
    bookingType: z.string(),
    vehicleType: z.string().min(1, 'Vehicle type is required'),
    passengers: z
      .number({ invalid_type_error: 'Passengers must be a number' })
      .int('Passengers must be a whole number')
      .min(1, 'At least 1 passenger')
      .max(8, 'Maximum 8 passengers'),
    airport: z.string().optional(),
  })
  .refine(
    (data) =>
      data.bookingType !== 'Airport Taxi' ||
      (data.airport && data.airport.trim().length > 0),
    {
      path: ['airport'],
      message: 'Please select an airport for airport taxi bookings',
    },
  );

type BookingFormValues = z.infer<typeof bookingSchema>;

type Trip = {
  id: string;
  destination: string;
  date: string;
  status: 'ON THE WAY' | 'COMPLETED' | 'PENDING' | 'CONFIRMED';
  icon: string;
};

type Warning = {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  detail?: string;
};

const DEMO_TRIPS: Trip[] = [
  { id: '1', destination: 'Grand Central Station', date: 'Nov 24, 2023 • 02:30 PM', status: 'ON THE WAY', icon: '🚗' },
  { id: '2', destination: 'Hotel Resort Lobby', date: 'Nov 23, 2023 • 10:15 AM', status: 'COMPLETED', icon: '✅' },
  { id: '3', destination: 'City Center Mall', date: 'Nov 25, 2023 • 06:00 PM', status: 'PENDING', icon: '📋' },
];

/* ─── Component ─── */
export default function GuestDashboard() {
  const { loadData, vehicles, bookings } = useAppStore();
  const { guest, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [bookingType, setBookingType] = useState('Airport Taxi');
  const [successBanner, setSuccessBanner] = useState(false);
  const [warnings, setWarnings] = useState<Warning[]>([]);

  useEffect(() => { void loadData(); }, [loadData]);

  // Auto-generate lightweight warnings for the guest based on live data.
  useEffect(() => {
    const newWarnings: Warning[] = [];

    const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
    if (pendingCount >= 3) {
      newWarnings.push({
        id: 'pending',
        type: 'warning',
        message: `There are ${pendingCount} pending trips in the queue.`,
        detail: 'Your driver might take a little longer than usual to arrive.',
      });
    }

    const availableVehicles = vehicles.filter((v) => v.status === 'Available');
    if (availableVehicles.length === 0 && vehicles.length > 0) {
      newWarnings.push({
        id: 'no-available-vehicles',
        type: 'info',
        message: 'All vehicles are currently in use.',
        detail: 'You can still place a request and we will assign a car as soon as one is free.',
      });
    }

    if (vehicles.length === 0) {
      newWarnings.push({
        id: 'no-vehicles',
        type: 'error',
        message: 'No vehicles available right now.',
        detail: 'Bookings may not be accepted until the fleet is configured.',
      });
    }

    setWarnings(newWarnings);
  }, [bookings, vehicles]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      pickupLocation: '',
      destination: '',
      pickupDate: '',
      pickupTime: '',
      bookingType: 'Airport Taxi',
      vehicleType: '',
      passengers: 1,
      airport: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: BookingFormValues) =>
      createBooking({
        guestName: guest?.name || 'Guest',
        pickupLocation: data.pickupLocation,
        dropoffLocation: data.destination,
        pickupTime: `${data.pickupDate}T${data.pickupTime}`,
        vehicleType: data.vehicleType,
        passengerCount: data.passengers,
        airport: data.airport,
      }),
    onSuccess: () => {
      setSuccessBanner(true);
      form.reset();
      void loadData();
      setTimeout(() => setSuccessBanner(false), 5000);
    },
  });

  // Combine live DB bookings + demo trips for display
  const dbTrips: Trip[] = bookings.slice(0, 3).map((b) => ({
    id: b._id,
    destination: b.dropoffLocation,
    date: new Date(b.pickupTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    status: (b.status === 'Confirmed' ? 'CONFIRMED' : b.status === 'Pending' ? 'PENDING' : b.status === 'Completed' ? 'COMPLETED' : 'ON THE WAY') as Trip['status'],
    icon: b.status === 'Completed' ? '✅' : b.status === 'Pending' ? '📋' : '🚗',
  }));

  const displayTrips = dbTrips.length > 0 ? dbTrips : DEMO_TRIPS;

  const statusColor = (s: Trip['status']) => {
    if (s === 'ON THE WAY') return 'status-badge on-way';
    if (s === 'COMPLETED') return 'status-badge completed';
    if (s === 'CONFIRMED') return 'status-badge confirmed';
    return 'status-badge pending';
  };

  const navItems = [
    { id: 'dashboard', icon: <DashIcon />, label: 'Dashboard' },
    { id: 'trips', icon: <RoutesIcon />, label: 'My Trips' },
    { id: 'billing', icon: <HistIcon />, label: 'Billing & History' },
    { id: 'support', icon: <SupportIcon />, label: 'Help & Support' },
  ];

  return (
    <div className="app-layout" style={{ background: '#f7f8fc' }}>
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ fontSize: 13 }}>🚌</div>
          GuestGo
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => setActiveNav('settings')}>
            <span className="nav-icon"><SettingIcon /></span>
            Settings
          </button>
          <button className="nav-item" onClick={() => { logout(); navigate('/login'); }} style={{ color: '#ef4444' }}>
            <span className="nav-icon">🚪</span>
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────── */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <h2>Welcome back, {guest?.name?.split(' ')[0] || 'Sarah'}</h2>
            <p>Easy airport transfers to and from your accommodation</p>
          </div>
          <div className="topbar-right">
            <button className="notif-btn" title="Notifications"><BellIcon /></button>
            <div className="avatar">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </header>

        {/* Success banner */}
        {successBanner && (
          <div
            className="warning-banner"
            style={{
              margin: '12px 28px 0',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              borderRadius: 10,
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            ✅ Booking submitted successfully! Your data has been saved to the database.
            <button
              onClick={() => setSuccessBanner(false)}
              style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: 16 }}
            >✕</button>
          </div>
        )}

        {/* Data-driven guest warnings */}
        {warnings.length > 0 && (
          <div style={{ margin: '12px 28px 0' }}>
            {warnings.map((w) => (
              <div
                key={w.id}
                className="warning-banner"
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '10px 14px',
                  borderRadius: 10,
                  marginBottom: 8,
                  fontSize: '0.8rem',
                  background:
                    w.type === 'error'
                      ? '#fef2f2'
                      : w.type === 'warning'
                        ? '#fffbeb'
                        : '#eff6ff',
                  border: `1px solid ${
                    w.type === 'error'
                      ? '#fecaca'
                      : w.type === 'warning'
                        ? '#fde68a'
                        : '#bfdbfe'
                  }`,
                  color:
                    w.type === 'error'
                      ? '#991b1b'
                      : w.type === 'warning'
                        ? '#92400e'
                        : '#1e40af',
                }}
              >
                <span style={{ marginTop: 2 }}>
                  <InfoIcon />
                </span>
                <div>
                  <strong>{w.message}</strong>
                  {w.detail && (
                    <p style={{ marginTop: 2, opacity: 0.9, fontSize: '0.75rem' }}>
                      {w.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="page-content fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, maxWidth: 1000 }}>

            {/* ── Left Column ─────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Book a Ride card */}
              <div className="card" style={{ padding: '28px 32px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem', fontWeight: 800, color: '#1a2152', marginBottom: 20 }}>
                  <span style={{ color: '#2b3aee' }}><TaxiIcon /></span> Book your airport taxi
                </h3>

                {/* Ride Type selector */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
                  {[
                    { label: 'Pickup', icon: <DropoffIcon /> },
                    { label: 'Airport Taxi', icon: <CarIcon /> },
                    { label: 'City Tour', icon: <TourIcon /> },
                  ].map(({ label, icon }) => (
                    <button
                      key={label}
                      type="button"
                      className={`ride-type-btn ${bookingType === label ? 'active' : ''}`}
                      onClick={() => { setBookingType(label); form.setValue('bookingType', label); }}
                      style={{ padding: '16px 10px', height: '100%' }}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>

                {/* Form */}
                <form onSubmit={form.handleSubmit((d) => mutation.mutate(d))}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: bookingType === 'Airport Taxi' ? 12 : 16 }}>
                    <div>
                      <label className="form-label">Pickup Location</label>
                      <div className="input-with-icon">
                        <span className="icon-left"><TargetIcon /></span>
                        <input
                          className="form-input bg-gray-input"
                          placeholder="Current location or enter add..."
                          {...form.register('pickupLocation')}
                        />
                      </div>
                      {form.formState.errors.pickupLocation && (
                        <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: 4 }}>
                          {form.formState.errors.pickupLocation.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Drop-off Location</label>
                      <div className="input-with-icon">
                        <span className="icon-left"><MapPinIcon /></span>
                        <input
                          className="form-input bg-gray-input"
                          placeholder="Where to?"
                          {...form.register('destination')}
                        />
                      </div>
                      {form.formState.errors.destination && (
                        <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: 4 }}>
                          {form.formState.errors.destination.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {bookingType === 'Airport Taxi' && (
                    <div style={{ marginBottom: 16 }}>
                      <label className="form-label">Select Airport (Sri Lanka)</label>
                      <select
                        className="form-select"
                        value={form.watch('airport') || ''}
                        onChange={(e) => form.setValue('airport', e.target.value)}
                      >
                        <option value="">Choose airport</option>
                        <option value="Bandaranaike International Airport (CMB) – Katunayake">
                          Bandaranaike International Airport (CMB) – Katunayake
                        </option>
                        <option value="Mattala Rajapaksa International Airport (HRI) – Mattala">
                          Mattala Rajapaksa International Airport (HRI) – Mattala
                        </option>
                      </select>
                      {form.formState.errors.airport && (
                        <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: 4 }}>
                          {form.formState.errors.airport.message}
                        </p>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div>
                      <label className="form-label">Pickup Date</label>
                      <div className="input-with-icon">
                        <span className="icon-left"><CalendarIcon /></span>
                        <input
                          type="date"
                          className="form-input bg-gray-input"
                          {...form.register('pickupDate')}
                        />
                      </div>
                      {form.formState.errors.pickupDate && (
                        <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: 4 }}>
                          {form.formState.errors.pickupDate.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Pickup Time</label>
                      <div className="input-with-icon">
                        <span className="icon-left"><ClockIcon /></span>
                        <input
                          type="time"
                          className="form-input bg-gray-input"
                          {...form.register('pickupTime')}
                        />
                      </div>
                      {form.formState.errors.pickupTime && (
                        <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: 4 }}>
                          {form.formState.errors.pickupTime.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <div>
                      <label className="form-label">Vehicle Type</label>
                      <select
                        className="form-select"
                        value={form.watch('vehicleType')}
                        onChange={(e) => form.setValue('vehicleType', e.target.value)}
                      >
                        <option value="">Select vehicle</option>
                        {/* Prefer live vehicle types from database, fall back to presets */}
                        {Array.from(
                          new Set(
                            vehicles
                              .map((v) => v.type)
                              .filter((t) => t && t.trim().length > 0),
                          ),
                        ).map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                        {vehicles.length === 0 && (
                          <>
                            <option value="Sedan">Sedan</option>
                            <option value="SUV">SUV</option>
                            <option value="Van">Van</option>
                          </>
                        )}
                      </select>
                      {form.formState.errors.vehicleType && (
                        <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: 4 }}>
                          {form.formState.errors.vehicleType.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="form-label">Number of Passengers</label>
                      <input
                        type="number"
                        min={1}
                        max={8}
                        className="form-input bg-gray-input"
                        {...form.register('passengers', {
                          valueAsNumber: true,
                        })}
                      />
                      {form.formState.errors.passengers && (
                        <p style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: 4 }}>
                          {form.formState.errors.passengers.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? 'Confirming…' : 'Confirm Booking'}
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => form.reset()}
                      style={{ height: 44, borderRadius: 10, fontSize: '0.9rem', color: '#1a2152', borderColor: '#e0e4f0' }}
                    >
                      Cancel Booking
                    </button>
                  </div>

                  {mutation.isError && (
                    <p style={{ textAlign: 'center', color: '#ef4444', fontSize: '0.78rem', marginTop: 10 }}>
                      ⚠️ Backend unreachable – make sure your server is running on port 5000.
                    </p>
                  )}
                </form>
              </div>

              {/* Price Estimate block */}
              <div className="card" style={{ padding: '28px 32px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem', fontWeight: 800, color: '#1a2152', marginBottom: 20 }}>
                  <span style={{ color: '#2b3aee' }}><TaxiIcon /></span> Book your airport taxi
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ color: '#1a2152', fontWeight: 500, fontSize: '0.9rem' }}>Base Fare</div>
                      <div style={{ color: '#8a94b2', fontSize: '0.7rem' }}>Includes first 5 miles</div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#1a2152', fontSize: '0.95rem' }}>$28.50</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#1a2152', fontWeight: 500, fontSize: '0.9rem' }}>Service Fee</div>
                    <div style={{ fontWeight: 800, color: '#1a2152', fontSize: '0.95rem' }}>$3.00</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#1a2152', fontWeight: 500, fontSize: '0.9rem' }}>Taxes & Government Fees</div>
                    <div style={{ fontWeight: 800, color: '#1a2152', fontSize: '0.95rem' }}>$2.50</div>
                  </div>

                  <div className="divider" style={{ margin: '4px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ color: '#1a2152', fontWeight: 800, fontSize: '1.05rem' }}>Estimated Total</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 900, color: '#2b3aee', fontSize: '2rem', lineHeight: 1 }}>$34.00</div>
                      <div style={{ color: '#8a94b2', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>FINAL PRICE MAY VARY</div>
                    </div>
                  </div>

                  <div style={{ background: '#f0f4ff', borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start', marginTop: 8 }}>
                    <span style={{ marginTop: 2 }}><InfoIcon /></span>
                    <p style={{ color: '#2b3aee', fontSize: '0.72rem', lineHeight: 1.5, margin: 0 }}>
                      The price shown is an estimate based on the selected vehicle type and distance. Tolls and surge pricing (if applicable) will be added to the final invoice.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column ─────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Active Trip Card */}
              <div className="active-trip-card" style={{ background: '#1c4ed8', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="trip-label" style={{ background: 'rgba(255,255,255,0.2)' }}>ACTIVE TRIP</div>
                  <RouteWindingIcon />
                </div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: 20, marginTop: 10 }}>Heading to<br />Airport</h3>

                <div className="driver-info" style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 14px', borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <img src="https://i.pravatar.cc/150?u=a042581f4e2902670" alt="Driver" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 12 }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Michael Chen</div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>White Tesla Model 3<br />3 • ABC-1234</div>
                    </div>
                  </div>
                  <button className="call-btn" style={{ background: 'white', color: '#1c4ed8', width: 40, height: 40 }}><PhoneIcon /></button>
                </div>

                <div className="map-preview" style={{ height: 160, background: '#7a8ba8', borderRadius: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="map-dot" style={{ margin: '0 auto' }}></div>
                    <div className="arriving-text" style={{ position: 'static', marginTop: 15, color: '#fff' }}>ARRIVING IN 4 MINS</div>
                  </div>
                  <div style={{ position: 'absolute', bottom: 5, fontSize: 10, opacity: 0.3, color: '#fff' }}>400×400</div>
                </div>
              </div>

              {/* Help & Support */}
              <div className="support-card" style={{ background: '#f5f6fa', border: '1px solid #e0e4f0' }}>
                <div className="support-icon" style={{ background: '#1c4ed8' }}>
                  <ChatIcon />
                </div>
                <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#1a2152', marginBottom: 6 }}>Need Assistance?</h4>
                <p style={{ fontSize: '0.78rem', color: '#6b7a99', lineHeight: 1.5, marginBottom: 18 }}>
                  Our support team is available 24/7<br />for guest transport needs.
                </p>
                <button className="btn-primary" style={{ background: '#1c4ed8', height: 42, fontSize: '0.85rem', marginBottom: 10 }}>
                  Chat with Support
                </button>
                <button className="btn-outline" style={{ background: 'white', width: '100%', height: 42, fontSize: '0.85rem', color: '#1a2152', borderColor: 'transparent' }}>
                  Call Dispatch
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
