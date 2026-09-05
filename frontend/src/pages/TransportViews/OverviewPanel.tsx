import React from 'react';
import { Check } from 'lucide-react';
import type { Booking, Driver, Vehicle } from '@/types';

interface OverviewPanelProps {
  bookings: Booking[];
  filteredBookings: Booking[];
  pendingBookings: Booking[];
  drivers: Driver[];
  availableDrivers: Driver[];
  vehicles: Vehicle[];
  setActiveNav: (nav: string) => void;
  statusCls: (status: string) => string;
  statusUpdating: Record<string, boolean>;
  handleStatusUpdate: (id: string, status: string) => void;
  handleOpenEditBooking: (b: any) => void;
  handleDeleteBooking: (id: string) => void;
  selectedBooking: string;
  setSelectedBooking: (val: string) => void;
  selectedDriver: string;
  setSelectedDriver: (val: string) => void;
  selectedVehicle: string;
  setSelectedVehicle: (val: string) => void;
  assigning: boolean;
  assignSuccess: boolean;
  handleAssign: () => void;
  autoAssigning: boolean;
  handleAutoAssign: () => void;
  viewMode: 'Revenue' | 'Trips';
  setViewMode: (mode: 'Revenue' | 'Trips') => void;
}

export default function OverviewPanel({
  bookings,
  filteredBookings,
  pendingBookings,
  availableDrivers,
  vehicles,
  setActiveNav,
  statusCls,
  statusUpdating,
  handleStatusUpdate,
  handleOpenEditBooking,
  handleDeleteBooking,
  selectedBooking,
  setSelectedBooking,
  selectedDriver,
  setSelectedDriver,
  selectedVehicle,
  setSelectedVehicle,
  assigning,
  assignSuccess,
  handleAssign,
  autoAssigning,
  handleAutoAssign,
  viewMode,
  setViewMode,
}: OverviewPanelProps) {
  return (
    <>
      <div className="admin-stats-grid">
        {[
          {
            label: 'Total Bookings',
            value: bookings.length || 0,
            extra: bookings.length > 0 ? '+12.5% from last month' : 'No data yet',
            color: '#2b3aee',
            textClr: '#16a34a',
          },
          {
            label: 'Active Trips',
            value: bookings.filter((b) => b.status === 'Confirmed').length,
            extra: 'Currently on track',
            color: '#22c55e',
            textClr: '#22c55e',
          },
          {
            label: 'Available Drivers',
            value: availableDrivers.length,
            extra: availableDrivers.length < 2 ? '⚠ Low availability' : 'All good',
            color: '#f59e0b',
            textClr: availableDrivers.length < 2 ? '#f59e0b' : '#22c55e',
          },
          {
            label: 'Pending Requests',
            value: pendingBookings.length,
            extra: pendingBookings.length > 0 ? `+ Needs assignment` : 'All assigned',
            color: '#6366f1',
            textClr: '#ef4444',
          },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value.toLocaleString()}</div>
            <div style={{ fontSize: '0.72rem', color: s.textClr, fontWeight: 600, marginTop: 6 }}>
              {s.extra}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Recent bookings table */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Recent Transport Bookings</h3>
            <button className="btn-outline" style={{ fontSize: '0.72rem' }} onClick={() => setActiveNav('bookings')}>
              View All
            </button>
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
                    <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px', fontStyle: 'italic' }}>
                      No recent bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.slice(0, 6).map((b) => (
                    <tr key={b._id}>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>{b.guestName}</td>
                      <td>
                        {b.vehicle ? (
                          <span
                            style={{
                              background: 'rgba(59, 130, 246, 0.15)',
                              color: '#60a5fa',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: '0.72rem',
                              fontWeight: 600,
                            }}
                          >
                            {(b.vehicle as any).type || 'Vehicle'}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td>{new Date(b.pickupTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>
                        <span className={statusCls(b.status)}>{b.status}</span>
                      </td>
                      <td>
                        {b.status === 'Confirmed' && (
                          <button
                            className="btn-outline"
                            style={{ fontSize: '0.7rem', height: 28, padding: '0 10px', color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.3)' }}
                            disabled={statusUpdating[b._id]}
                            onClick={() => handleStatusUpdate(b._id, 'Completed')}
                          >
                            {statusUpdating[b._id] ? '…' : '✓ Complete'}
                          </button>
                        )}
                        {b.status === 'Pending' && !b.driver && (
                          <span style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 600 }}>Needs driver</span>
                        )}
                        {b.status === 'Completed' && <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>✓ Done</span>}
                        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                          <button
                            className="btn-outline"
                            style={{ fontSize: '0.65rem', height: 28, padding: '0 10px' }}
                            onClick={() => handleOpenEditBooking(b)}
                          >
                            ✎ Edit
                          </button>
                          <button
                            className="btn-outline"
                            style={{ fontSize: '0.65rem', height: 28, padding: '0 10px', color: '#dc2626', borderColor: '#fecaca' }}
                            onClick={() => handleDeleteBooking(b._id)}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Driver Assignment */}
        <div className="assign-card">
          <h3>Quick Driver Assignment</h3>
          <p>Match pending bookings with available resources</p>

          {assignSuccess && (
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 14,
                fontSize: '0.8rem',
                color: '#4ade80',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <Check size={16} /> Assignment saved to database successfully!
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Select Booking</label>
            <select className="form-select" value={selectedBooking} onChange={(e) => setSelectedBooking(e.target.value)}>
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
            <select className="form-select" value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
              <option value="">-- Choose a driver --</option>
              {availableDrivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} (Available)
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label className="form-label">Select Vehicle</label>
            <select className="form-select" value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
              <option value="">-- Choose a vehicle --</option>
              {vehicles
                .filter((v) => v.status === 'Available')
                .map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.type} ({v.plateNumber})
                  </option>
                ))}
            </select>
          </div>

          {vehicles.filter((v) => v.status === 'Available').length > 0 && selectedBooking && (
            <div className="info-box">
              ℹ️ Estimated travel time is 25 mins. Vehicle:{' '}
              <strong style={{ marginLeft: 4 }}>
                {vehicles.find((v) => v._id === selectedVehicle)?.type || 'Select a vehicle'}
              </strong>
            </div>
          )}

          {vehicles.filter((v) => v.status === 'Available').length === 0 && (
            <div className="info-box" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
              ⚠️ No available vehicles in database. Add vehicles first.
            </div>
          )}

          <button
            className="btn-primary"
            disabled={assigning || !selectedBooking || !selectedDriver || !selectedVehicle}
            onClick={handleAssign}
            style={{ marginTop: 4 }}
          >
            {assigning ? 'Saving…' : '✓ Confirm Assignment'}
          </button>
          <button
            className="btn-outline"
            disabled={autoAssigning || pendingBookings.length === 0}
            onClick={handleAutoAssign}
            style={{ marginTop: 10, width: '100%' }}
          >
            {autoAssigning ? 'Auto Assigning…' : '⚡ Auto Assign Pending'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>Weekly Billing Summary</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['Revenue', 'Trips'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 5,
                    border: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: viewMode === v ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
                    color: viewMode === v ? '#ffffff' : '#94a3b8',
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, alignItems: 'flex-end', height: 100 }}>
            {[30, 55, 40, 70, 60, 90, 45].map((h, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div
                  style={{
                    width: '100%',
                    height: `${h}%`,
                    minHeight: 4,
                    background: i === 5 ? '#3b82f6' : 'rgba(148, 163, 184, 0.2)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease',
                  }}
                />
                <span style={{ fontSize: '0.62rem', color: '#94a3b8' }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
              </div>
            ))}
          </div>
          <div className="divider" style={{ marginTop: 14 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#cbd5e1' }}>
            <span>Total ({viewMode})</span>
            <strong style={{ color: '#ffffff' }}>
              {viewMode === 'Revenue' ? 'Rs 3,240.00' : `${bookings.length} trips`}
            </strong>
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>Quick Transport Reports</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Total Bookings', val: bookings.length, icon: '📋', clr: 'rgba(59, 130, 246, 0.1)' },
              { label: 'Completed', val: bookings.filter((b) => b.status === 'Completed').length, icon: '✅', clr: 'rgba(34, 197, 94, 0.1)' },
              { label: 'Pending', val: pendingBookings.length, icon: '⏳', clr: 'rgba(245, 158, 11, 0.15)' },
              { label: 'Available Vehicles', val: vehicles.filter((v) => v.status === 'Available').length, icon: '🚗', clr: 'rgba(139, 92, 246, 0.1)' },
            ].map((r) => (
              <div key={r.label} style={{ background: r.clr, borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, margin: '0 0 6px 0' }}>{r.icon}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>{r.val}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 }}>{r.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
