import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import { updateBookingStatus, assignBooking } from '@/lib/api';

/* ─── Inline SVG icons ─── */
const BellIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const DashIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
const BookIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
const DrvrIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>;
const CarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="13" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="12" /></svg>;
const ChartIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const WarnIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const SettingIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93l-1.41 1.41M12 2v2M4.93 4.93l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M12 20v2m5.66-2.34l-1.41-1.41" /></svg>;
const TripsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7H11a3.5 3.5 0 0 1 0-7H17" /><circle cx="18" cy="5" r="3" /></svg>;
const XIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;

/* ─── Warning types ─── */
interface Warning {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  detail?: string;
}

export default function AdminDashboard() {
  const { bookings, drivers, vehicles, loadData } = useAppStore();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'Revenue' | 'Trips'>('Revenue');
  const [selectedBooking, setSelectedBooking] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => { void loadData(); }, [loadData]);

  /* =========================================================
   *  ⚠️  WARNING FUNCTION — checks DB data and generates alerts
   * ========================================================= */
  useEffect(() => {
    const newWarnings: Warning[] = [];

    // 1. Pending bookings that haven't been assigned a driver
    const unassigned = bookings.filter(
      (b) => b.status === 'Pending' && !b.driver
    );
    if (unassigned.length > 0) {
      newWarnings.push({
        id: 'unassigned',
        type: 'error',
        message: `⚠️ ${unassigned.length} booking${unassigned.length > 1 ? 's' : ''} need${unassigned.length === 1 ? 's' : ''} driver assignment!`,
        detail: `Pending: ${unassigned.map(b => b.guestName).join(', ')}`,
      });
    }

    // 2. Low driver availability
    const availableDrivers = drivers.filter(d => d.availability);
    if (availableDrivers.length < 2 && drivers.length > 0) {
      newWarnings.push({
        id: 'low-drivers',
        type: 'warning',
        message: `⚠️ Low driver availability — only ${availableDrivers.length} driver${availableDrivers.length !== 1 ? 's' : ''} available`,
        detail: 'Consider adding more drivers or releasing current ones.',
      });
    }

    // 3. No vehicles in the database
    if (vehicles.length === 0) {
      newWarnings.push({
        id: 'no-vehicles',
        type: 'error',
        message: '⚠️ No vehicles found in database!',
        detail: 'Add vehicles to allow guests to make bookings.',
      });
    }

    // 4. Pending requests piling up
    const pendingCount = bookings.filter(b => b.status === 'Pending').length;
    if (pendingCount >= 5) {
      newWarnings.push({
        id: 'overload',
        type: 'warning',
        message: `⚠️ High load — ${pendingCount} pending requests are queued!`,
        detail: 'Assign drivers quickly to avoid guest delays.',
      });
    }

    setWarnings(newWarnings);
  }, [bookings, drivers, vehicles]);

  const dismissWarning = (id: string) =>
    setWarnings((w) => w.filter((x) => x.id !== id));

  /* ── Status Update (connected to DB) ── */
  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setStatusUpdating((prev) => ({ ...prev, [bookingId]: true }));
    try {
      await updateBookingStatus(bookingId, newStatus);
      await loadData();
    } catch {
      alert('Failed to update status. Is the backend running?');
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  /* ── Quick Assignment (connected to DB) ── */
  const handleAssign = async () => {
    if (!selectedBooking || !selectedDriver) return;
    const avail = vehicles.filter(v => v.status === 'Available');
    if (avail.length === 0) { alert('No available vehicles!'); return; }

    setAssigning(true);
    try {
      await assignBooking(selectedBooking, { driverId: selectedDriver, vehicleId: avail[0]._id });
      await loadData();
      setAssignSuccess(true);
      setSelectedBooking('');
      setSelectedDriver('');
      setTimeout(() => setAssignSuccess(false), 3000);
    } catch {
      alert('Assignment failed. Check that the driver & vehicle are available.');
    } finally {
      setAssigning(false);
    }
  };

  /* ── Filtered bookings ── */
  const filteredBookings = bookings.filter((b) =>
    !searchQuery ||
    b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.dropoffLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingBookings = bookings.filter(b => b.status === 'Pending');
  const availableDrivers = drivers.filter(d => d.availability);

  const statusCls = (s: string) => {
    if (s === 'Pending') return 'status-badge pending';
    if (s === 'Confirmed') return 'status-badge confirmed';
    if (s === 'Completed') return 'status-badge completed';
    return 'status-badge on-way';
  };

  const navItems = [
    { id: 'dashboard', icon: <DashIcon />, label: 'Dashboard' },
    { id: 'bookings', icon: <BookIcon />, label: 'Bookings' },
    { id: 'drivers', icon: <DrvrIcon />, label: 'Drivers' },
    { id: 'vehicles', icon: <CarIcon />, label: 'Vehicles' },
    { id: 'reports', icon: <ChartIcon />, label: 'Reports' },
  ];

  return (
    <div className="app-layout" style={{ background: '#f7f8fc' }}>
      {/* ── Sidebar ─── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon" style={{ fontSize: 13 }}>🚌</div>
          TransPort
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
          <button className="nav-item">
            <span className="nav-icon"><SettingIcon /></span>
            Settings
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '0 4px' }}>
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, flexShrink: 0 }}>A</div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a2152' }}>Alex Johnson</div>
              <div style={{ fontSize: '0.7rem', color: '#8a94b2' }}>Fleet Manager</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ─── */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#8a94b2' }}>
                <SearchIcon />
              </span>
              <input
                className="form-input"
                style={{ paddingLeft: 34, height: 36, fontSize: '0.82rem' }}
                placeholder="Search bookings, drivers, or guests…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="topbar-right">
            <button className="notif-btn" title="Notifications">
              <BellIcon />
              {warnings.length > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16,
                  background: '#ef4444', color: 'white',
                  borderRadius: '50%', fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{warnings.length}</span>
              )}
            </button>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['Revenue', 'Trips'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  style={{
                    padding: '5px 14px', borderRadius: 6, border: 'none',
                    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                    background: viewMode === v ? '#2b3aee' : '#f0f2fa',
                    color: viewMode === v ? 'white' : '#6b7a99',
                    transition: 'all 0.15s',
                  }}
                >{v}</button>
              ))}
            </div>
            <div className="avatar">A</div>
          </div>
        </header>

        <div className="page-content fade-in">

          {/* Page Title */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a2152' }}>Management Overview</h1>
            <p style={{ fontSize: '0.82rem', color: '#8a94b2', marginTop: 2 }}>Track and manage guest transportation in real-time.</p>
          </div>

          {/* ⚠️ Warning Banners — connected to DB */}
          {warnings.map((w) => (
            <div
              key={w.id}
              className="warning-banner"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 16px',
                borderRadius: 10,
                marginBottom: 10,
                fontSize: '0.82rem',
                background: w.type === 'error' ? '#fef2f2' : w.type === 'warning' ? '#fffbeb' : '#eff6ff',
                border: `1px solid ${w.type === 'error' ? '#fecaca' : w.type === 'warning' ? '#fde68a' : '#bfdbfe'}`,
                color: w.type === 'error' ? '#991b1b' : w.type === 'warning' ? '#92400e' : '#1e40af',
              }}
            >
              <WarnIcon />
              <div style={{ flex: 1 }}>
                <strong>{w.message}</strong>
                {w.detail && <p style={{ marginTop: 2, opacity: 0.8, fontSize: '0.75rem' }}>{w.detail}</p>}
              </div>
              <button
                onClick={() => dismissWarning(w.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6, color: 'currentColor' }}
              >
                <XIcon />
              </button>
            </div>
          ))}

          {/* Stats Row */}
          <div className="admin-stats-grid">
            {[
              { label: 'Total Bookings', value: bookings.length || 0, extra: bookings.length > 0 ? '+12.5% from last month' : 'No data yet', color: '#2b3aee', badgeClr: '#dcfce7', textClr: '#16a34a' },
              { label: 'Active Trips', value: bookings.filter(b => b.status === 'Confirmed').length, extra: 'Currently on track', color: '#22c55e', badgeClr: undefined, textClr: '#22c55e' },
              { label: 'Available Drivers', value: availableDrivers.length, extra: availableDrivers.length < 2 ? '⚠ Low availability' : 'All good', color: '#f59e0b', badgeClr: undefined, textClr: availableDrivers.length < 2 ? '#f59e0b' : '#22c55e' },
              { label: 'Pending Requests', value: pendingBookings.length, extra: pendingBookings.length > 0 ? `+ Needs assignment` : 'All assigned', color: '#6366f1', badgeClr: undefined, textClr: '#ef4444' },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value.toLocaleString()}</div>
                <div style={{ fontSize: '0.72rem', color: s.textClr, fontWeight: 600, marginTop: 6 }}>{s.extra}</div>
              </div>
            ))}
          </div>

          {/* Main two-col grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Recent bookings table */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a2152' }}>Recent Transport Bookings</h3>
                <button className="btn-outline" style={{ fontSize: '0.72rem' }}>View All</button>
              </div>
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Guest Name</th>
                      <th>Vehicle</th>
                      <th>Pickup Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: '#8a94b2', padding: '24px', fontStyle: 'italic' }}>
                          {searchQuery ? 'No matching bookings.' : 'No bookings yet. Guest dashboard can create one!'}
                        </td>
                      </tr>
                    ) : filteredBookings.slice(0, 6).map((b) => (
                      <tr key={b._id}>
                        <td style={{ fontWeight: 600, color: '#1a2152' }}>{b.guestName}</td>
                        <td>
                          {b.vehicle ? (
                            <span style={{ background: '#eef2ff', color: '#4338ca', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>
                              {(b.vehicle as any).type || 'Vehicle'}
                            </span>
                          ) : (
                            <span style={{ color: '#8a94b2', fontSize: '0.75rem' }}>Unassigned</span>
                          )}
                        </td>
                        <td>{new Date(b.pickupTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                        <td><span className={statusCls(b.status)}>{b.status}</span></td>
                        <td>
                          {b.status === 'Confirmed' && (
                            <button
                              className="btn-outline"
                              style={{ fontSize: '0.7rem', height: 28, padding: '0 10px', color: '#22c55e', borderColor: '#bbf7d0' }}
                              disabled={statusUpdating[b._id]}
                              onClick={() => handleStatusUpdate(b._id, 'Completed')}
                            >
                              {statusUpdating[b._id] ? '…' : '✓ Complete'}
                            </button>
                          )}
                          {b.status === 'Pending' && !b.driver && (
                            <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>Needs driver</span>
                          )}
                          {b.status === 'Completed' && (
                            <span style={{ fontSize: '0.7rem', color: '#22c55e' }}>✓ Done</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Driver Assignment */}
            <div className="assign-card">
              <h3>Quick Driver Assignment</h3>
              <p>Match pending bookings with available resources</p>

              {assignSuccess && (
                <div style={{
                  background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
                  padding: '10px 12px', marginBottom: 14, fontSize: '0.8rem',
                  color: '#15803d', display: 'flex', gap: 8, alignItems: 'center',
                }}>
                  <CheckIcon /> Assignment saved to database successfully!
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Select Booking</label>
                <select
                  className="form-select"
                  value={selectedBooking}
                  onChange={(e) => setSelectedBooking(e.target.value)}
                >
                  <option value="">-- Choose a pending booking --</option>
                  {pendingBookings.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.guestName} – {new Date(b.pickupTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="form-label">Select Driver</label>
                <select
                  className="form-select"
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                >
                  <option value="">-- Choose a driver --</option>
                  {availableDrivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} (Available)
                    </option>
                  ))}
                </select>
              </div>

              {vehicles.filter(v => v.status === 'Available').length > 0 && selectedBooking && (
                <div className="info-box">
                  ℹ️ Estimated travel time for this route is 25 mins based on current traffic.
                  Vehicle: <strong style={{ marginLeft: 4 }}>
                    {vehicles.find(v => v.status === 'Available')?.type}
                  </strong>
                </div>
              )}

              {vehicles.filter(v => v.status === 'Available').length === 0 && (
                <div className="info-box" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b' }}>
                  ⚠️ No available vehicles in database. Add vehicles first.
                </div>
              )}

              <button
                className="btn-primary"
                disabled={assigning || !selectedBooking || !selectedDriver}
                onClick={handleAssign}
                style={{ marginTop: 4 }}
              >
                {assigning ? 'Saving…' : '✓ Confirm Assignment'}
              </button>
            </div>
          </div>

          {/* Bottom row: Billing Summary + Quick Reports */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a2152' }}>Weekly Billing Summary</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['Revenue', 'Trips'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setViewMode(v)}
                      style={{
                        padding: '3px 10px', borderRadius: 5, border: 'none',
                        fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                        background: viewMode === v ? '#2b3aee' : '#f0f2fa',
                        color: viewMode === v ? 'white' : '#6b7a99',
                      }}
                    >{v}</button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, alignItems: 'flex-end', height: 100 }}>
                {[30, 55, 40, 70, 60, 90, 45].map((h, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: '100%', height: `${h}%`, minHeight: 4,
                      background: i === 5 ? '#2b3aee' : '#e0e4f0',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease',
                    }} />
                    <span style={{ fontSize: '0.62rem', color: '#8a94b2' }}>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="divider" style={{ marginTop: 14 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#6b7a99' }}>
                <span>Total ({viewMode})</span>
                <strong style={{ color: '#1a2152' }}>{viewMode === 'Revenue' ? '$3,240.00' : `${bookings.length} trips`}</strong>
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a2152', marginBottom: 14 }}>Quick Transport Reports</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Total Bookings', val: bookings.length, icon: '📋', clr: '#eff6ff' },
                  { label: 'Completed', val: bookings.filter(b => b.status === 'Completed').length, icon: '✅', clr: '#f0fdf4' },
                  { label: 'Pending', val: pendingBookings.length, icon: '⏳', clr: '#fffbeb' },
                  { label: 'Available Vehicles', val: vehicles.filter(v => v.status === 'Available').length, icon: '🚗', clr: '#fdf4ff' },
                ].map((r) => (
                  <div key={r.label} style={{ background: r.clr, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{r.icon}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a2152' }}>{r.val}</div>
                    <div style={{ fontSize: '0.7rem', color: '#8a94b2', marginTop: 2 }}>{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
