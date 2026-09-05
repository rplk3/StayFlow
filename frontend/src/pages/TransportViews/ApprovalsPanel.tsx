import React from 'react';
import type { PendingDriver } from '@/types';

interface ApprovalsPanelProps {
  pendingDriversList: PendingDriver[];
  approvingId: string | null;
  rejectingId: string | null;
  handleApproveDriver: (id: string) => void;
  handleRejectDriver: (id: string) => void;
}

export default function ApprovalsPanel({
  pendingDriversList,
  approvingId,
  rejectingId,
  handleApproveDriver,
  handleRejectDriver,
}: ApprovalsPanelProps) {
  return (
    <div style={{ maxWidth: 1000 }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: 6 }}>
        Driver Registration Approvals
      </h3>
      <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: 20 }}>
        Review and approve driver registrations with their vehicle information.
      </p>

      {pendingDriversList.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
            No Pending Registrations
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            All driver registrations have been processed.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pendingDriversList.map((d) => (
            <div key={d._id} className="card" style={{ padding: 24, border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                    }}
                  >
                    {d.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{d.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Applied: {new Date(d.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    padding: '4px 14px',
                    borderRadius: 20,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                  }}
                >
                  ⏳ Pending
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 18 }}>
                {/* Personal Details */}
                <div style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 12, border: '1px solid rgba(148, 163, 184, 0.1)' }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 12,
                    }}
                  >
                    👤 Personal Details
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[
                      { label: 'Email', value: d.email },
                      { label: 'License', value: d.licenseNumber },
                      { label: 'Contact', value: d.contact },
                      { label: 'NIC', value: d.nic || '—' },
                      { label: 'Address', value: d.address || '—' },
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: '#94a3b8' }}>{item.label}</span>
                        <span style={{ fontWeight: 600, color: '#ffffff' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle Details */}
                <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: 12, border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                  <div
                    style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 12,
                    }}
                  >
                    🚗 Vehicle Details
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {[
                      { label: 'Type', value: d.vehicle?.type || '—' },
                      { label: 'Make', value: d.vehicle?.make || '—' },
                      { label: 'Model', value: d.vehicle?.model || '—' },
                      { label: 'Year', value: d.vehicle?.year || '—' },
                      { label: 'Plate', value: d.vehicle?.plateNumber || '—' },
                      { label: 'Capacity', value: d.vehicle?.capacity ? `${d.vehicle.capacity} pax` : '—' },
                      { label: 'Color', value: d.vehicle?.color || '—' },
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: '#94a3b8' }}>{item.label}</span>
                        <span style={{ fontWeight: 600, color: '#ffffff' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleRejectDriver(d._id)}
                  disabled={rejectingId === d._id}
                  style={{
                    padding: '9px 22px',
                    borderRadius: 10,
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#f87171',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: rejectingId === d._id ? 'wait' : 'pointer',
                  }}
                >
                  {rejectingId === d._id ? 'Rejecting…' : '✕ Reject'}
                </button>
                <button
                  onClick={() => handleApproveDriver(d._id)}
                  disabled={approvingId === d._id}
                  style={{
                    padding: '9px 22px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#22c55e',
                    color: 'white',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: approvingId === d._id ? 'wait' : 'pointer',
                    boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                  }}
                >
                  {approvingId === d._id ? 'Approving…' : '✓ Approve Driver'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
