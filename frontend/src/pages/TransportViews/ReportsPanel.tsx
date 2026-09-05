import React from 'react';

export default function ReportsPanel() {
  return (
    <div className="card" style={{ padding: 24, maxWidth: 800 }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a2152', marginBottom: 20 }}>
        Generate Reports
      </h3>
      <p style={{ color: '#8a94b2' }}>Select a date range to generate operations and revenue reports.</p>
      <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
        <input type="date" className="form-input" style={{ maxWidth: 200 }} />
        <input type="date" className="form-input" style={{ maxWidth: 200 }} />
        <button className="btn-primary" style={{ maxWidth: 150 }}>
          Download PDF
        </button>
      </div>
    </div>
  );
}
