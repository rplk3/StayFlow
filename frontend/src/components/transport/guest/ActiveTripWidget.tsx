import { Car, Phone, XCircle, Clock, CheckCircle2, User } from 'lucide-react';
import type { Booking } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { updateBookingStatus } from '@/lib/api';
import { useState } from 'react';

export default function ActiveTripWidget({ bookings }: { bookings: Booking[] }) {
  const { loadData } = useAppStore();
  const [cancelling, setCancelling] = useState(false);

  // Use the passed bookings directly (they are already filtered in the parent)
  const myBookings = bookings;
  
  // Get the most recent booking
  const activeBooking = myBookings.sort(
    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  if (!activeBooking) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
        <div
          className="active-trip-card"
          style={{
            background: '#ffffff',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            padding: 40,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            color: '#94a3b8',
            textAlign: 'center',
          }}
        >
          <Car size={64} color="#e2e8f0" style={{ marginBottom: 16 }} />
          <h3 style={{ margin: '0 0 8px 0', color: '#64748b', fontSize: '1.2rem' }}>No Active Bookings</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Fill out the form to reserve your transport.</p>
        </div>
      </div>
    );
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      setCancelling(true);
      await updateBookingStatus(activeBooking._id!, 'Cancelled');
      await loadData();
    } catch (error) {
      console.error(error);
      alert('Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const isCancellable = activeBooking.status === 'Pending' || activeBooking.status === 'Confirmed';
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Confirmed': return '#3b82f6';
      case 'On the Way': return '#8b5cf6';
      case 'Completed': return '#10b981';
      case 'Cancelled': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Pending': return 'rgba(245, 158, 11, 0.15)';
      case 'Confirmed': return 'rgba(59, 130, 246, 0.15)';
      case 'On the Way': return 'rgba(139, 92, 246, 0.15)';
      case 'Completed': return 'rgba(16, 185, 129, 0.15)';
      case 'Cancelled': return 'rgba(239, 68, 68, 0.15)';
      default: return 'rgba(100, 116, 139, 0.15)';
    }
  };

  const statusColor = getStatusColor(activeBooking.status);
  const statusBg = getStatusBg(activeBooking.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div
        className="active-trip-card"
        style={{
          background: '#ffffff',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ background: '#0a192f', padding: '24px 24px 20px', color: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', opacity: 0.8 }}>
              LATEST BOOKING
            </div>
            <div
              style={{
                background: statusBg,
                color: statusColor,
                padding: '4px 8px',
                borderRadius: 4,
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                textTransform: 'uppercase',
              }}
            >
              <span style={{ width: 6, height: 6, background: statusColor, borderRadius: '50%' }} /> 
              {activeBooking.status}
            </div>
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {activeBooking.pickupLocation.split(',')[0]} → {activeBooking.dropoffLocation.split(',')[0]}
          </h3>
          <p style={{ margin: '0 0 16px 0', opacity: 0.8, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} /> 
            {new Date(activeBooking.pickupTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
          </p>
          
          {isCancellable && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: cancelling ? 'not-allowed' : 'pointer',
                width: '100%',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)')}
              onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)')}
            >
              <XCircle size={16} />
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </button>
          )}
        </div>

        {/* Topographic Map/Pattern Stand-in */}
        <div
          style={{
            height: 180,
            background: '#1e293b',
            position: 'relative',
            backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#2563eb',
              padding: 8,
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
            }}
          >
            <Car size={20} color="white" />
          </div>
          {/* Fake route line */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <path d="M 120 160 Q 150 110 170 80" stroke="#38bdf8" strokeWidth="4" fill="none" strokeDasharray="6 6" />
          </svg>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activeBooking.driver ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: '50%', 
                background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#64748b'
              }}>
                <User size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{activeBooking.driver.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#eab308' }}>★</span> 5.0 <span style={{ opacity: 0.5 }}>|</span> Professional
                </div>
              </div>
              <a
                href={`tel:${activeBooking.driver.contact}`}
                style={{
                  width: 40,
                  height: 40,
                  background: '#e0e7ff',
                  color: '#3730a3',
                  border: 'none',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                <Phone size={16} />
              </a>
            </div>
          ) : (
             <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: 0.7 }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: '50%', 
                background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#94a3b8', border: '1px dashed #cbd5e1'
              }}>
                <User size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>Driver unassigned</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Waiting for admin assignment
                </div>
              </div>
             </div>
          )}

          <div style={{ position: 'relative', marginTop: 8 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                color: '#475569',
                marginBottom: 8,
              }}
            >
              <span style={{ maxWidth: '45%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeBooking.pickupLocation}
              </span>
              <span style={{ maxWidth: '45%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'right' }}>
                {activeBooking.dropoffLocation}
              </span>
            </div>
            <div style={{ height: 6, background: '#eef1f6', borderRadius: 3, position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: activeBooking.status === 'Completed' ? '100%' : activeBooking.status === 'On the Way' ? '50%' : activeBooking.status === 'Cancelled' ? '0%' : '10%',
                  background: statusColor,
                  borderRadius: 3,
                  transition: 'width 1s ease-in-out',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
