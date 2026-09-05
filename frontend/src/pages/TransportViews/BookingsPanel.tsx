import React from 'react';
import type { Booking } from '@/types';

interface BookingsPanelProps {
  bookings: Booking[];
  statusCls: (status: string) => string;
  handleOpenEditBooking: (booking: any) => void;
  handleDeleteBooking: (id: string) => void;
}

export default function BookingsPanel({
  bookings,
  statusCls,
  handleOpenEditBooking,
  handleDeleteBooking,
}: BookingsPanelProps) {
  return (
    <div className="card" style={{ padding: 24, maxWidth: 1000 }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: 20 }}>All Bookings</h3>
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Route</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td style={{ fontWeight: 600 }}>{b.guestName}</td>
                <td>{b.vehicle ? (b.vehicle as any).type : 'Unassigned'}</td>
                <td>{b.driver ? (b.driver as any).name : 'Unassigned'}</td>
                <td
                  style={{
                    maxWidth: 200,
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    display: '-webkit-box',
                  }}
                >
                  {b.pickupLocation} ➔ {b.dropoffLocation}
                </td>
                <td>
                  <span className={statusCls(b.status)}>{b.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      className="btn-outline"
                      style={{ fontSize: '0.65rem', height: 28, padding: '0 10px' }}
                      onClick={() => handleOpenEditBooking(b)}
                    >
                      ✎ Edit
                    </button>
                    <button
                      className="btn-outline"
                      style={{
                        fontSize: '0.65rem',
                        height: 28,
                        padding: '0 10px',
                        color: '#ef4444',
                        borderColor: 'rgba(239, 68, 68, 0.2)',
                      }}
                      onClick={() => handleDeleteBooking(b._id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6}>No bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
