import React from 'react';
import type { Driver } from '@/types';

interface DriversPanelProps {
  drivers: Driver[];
  handleAddDriver: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export default function DriversPanel({ drivers, handleAddDriver }: DriversPanelProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, maxWidth: 1000 }}>
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: 20 }}>Manage Drivers</h3>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>License Number</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d._id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td>{d.licenseNumber}</td>
                  <td>{d.contact}</td>
                  <td>
                    {d.availability ? (
                      <span style={{ color: '#4ade80', fontWeight: 700 }}>Available</span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontWeight: 700 }}>Busy</span>
                    )}
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr>
                  <td colSpan={4}>No drivers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ padding: 24, height: 'max-content' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: 20 }}>Add Driver</h3>
        <form onSubmit={handleAddDriver} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Name</label>
            <input className="form-input bg-gray-input" name="name" placeholder="John Doe" required />
          </div>
          <div>
            <label className="form-label">License Number</label>
            <input className="form-input bg-gray-input" name="licenseNumber" placeholder="DL-123456" required />
          </div>
          <div>
            <label className="form-label">Contact</label>
            <input className="form-input bg-gray-input" name="contact" placeholder="+1 234 567 890" required />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>
            Add Driver
          </button>
        </form>
      </div>
    </div>
  );
}
