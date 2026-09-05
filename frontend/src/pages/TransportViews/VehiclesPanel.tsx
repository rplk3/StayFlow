import React from 'react';
import type { Vehicle } from '@/types';

const VEHICLE_MODELS: Record<string, string[]> = {
  Toyota: ['Camry', 'Corolla', 'Prius', 'Alphard', 'Hiace', 'Land Cruiser'],
  Honda: ['Civic', 'Accord', 'CR-V', 'Stepwgn'],
  Nissan: ['Altima', 'Sentra', 'Rogue', 'Caravan', 'Navara'],
  Mercedes: ['E-Class', 'V-Class', 'S-Class', 'Sprinter'],
  BMW: ['5 Series', '7 Series', 'X5'],
  Ford: ['Transit', 'Explorer', 'Focus', 'Tourneo'],
  Audi: ['A6', 'A8', 'Q7'],
  Hyundai: ['Sonata', 'Tucson', 'Palisade', 'Staria', 'Elantra'],
  Kia: ['Optima', 'Sorento', 'Carnival', 'Sedona'],
};

interface VehiclesPanelProps {
  vehicles: Vehicle[];
  handleAddVehicle: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  selectedMake: string;
  setSelectedMake: (make: string) => void;
}

export default function VehiclesPanel({
  vehicles,
  handleAddVehicle,
  selectedMake,
  setSelectedMake,
}: VehiclesPanelProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, maxWidth: 1000 }}>
      {/* List */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: 20 }}>Manage Vehicles</h3>
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Make & Model</th>
                <th>Type / Year</th>
                <th>Capacity</th>
                <th>Plate Number</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v._id}>
                  <td style={{ fontWeight: 600 }}>
                    {v.make} {v.model}
                  </td>
                  <td>
                    {v.type} <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({v.year})</span>
                  </td>
                  <td>{v.capacity} pax</td>
                  <td>{v.plateNumber}</td>
                  <td>
                    {v.status === 'Available' ? (
                      <span style={{ color: '#4ade80', fontWeight: 700 }}>Available</span>
                    ) : (
                      <span style={{ color: '#f87171', fontWeight: 700 }}>{v.status}</span>
                    )}
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={5}>No vehicles found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Form */}
      <div className="card" style={{ padding: 24, height: 'max-content' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: 20 }}>Add Vehicle</h3>
        <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="form-label">Make (Company)</label>
            <select
              className="form-select bg-gray-input"
              name="make"
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              required
            >
              {Object.keys(VEHICLE_MODELS).map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Model</label>
            <select className="form-select bg-gray-input" name="model" required>
              {VEHICLE_MODELS[selectedMake]?.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="form-label">Year</label>
              <select className="form-select bg-gray-input" name="year" required defaultValue="2024">
                {Array.from({ length: 15 }, (_, i) => 2026 - i).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Type</label>
              <select className="form-select bg-gray-input" name="type" required>
                {[
                  'Sedan',
                  'SUV',
                  'Minivan',
                  'Passenger Van',
                  'Luxury Sedan',
                  'Mini Bus',
                  'Bus',
                  'Coach Bus',
                  'Extended Coach',
                ].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
            <div>
              <label className="form-label">Plate Number</label>
              <input className="form-input bg-gray-input" name="plateNumber" placeholder="ABC-1234" required />
            </div>
            <div>
              <label className="form-label">Capacity (Pax)</label>
              <input type="number" min="1" max="100" className="form-input bg-gray-input" name="capacity" defaultValue="4" required />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>
            Add Vehicle
          </button>
        </form>
      </div>
    </div>
  );
}
