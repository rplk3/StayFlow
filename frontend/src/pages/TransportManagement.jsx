import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/appStore';
import {
  updateBookingStatus,
  assignBooking,
  createDriver,
  createVehicle,
  getPendingDrivers,
  approveDriver,
  rejectDriver,
  deleteBooking,
  updateBooking,
} from '@/lib/api';
import { X, AlertCircle, Car } from 'lucide-react';

// Views
import OverviewPanel from './TransportViews/OverviewPanel';
import BookingsPanel from './TransportViews/BookingsPanel';
import DriversPanel from './TransportViews/DriversPanel';
import VehiclesPanel from './TransportViews/VehiclesPanel';
import ApprovalsPanel from './TransportViews/ApprovalsPanel';
import ReportsPanel from './TransportViews/ReportsPanel';

export default function TransportManagement() {
  const { bookings, drivers, vehicles, loadData } = useAppStore();
  
  // Navigation & UI State
  const [activeNav, setActiveNav] = useState('dashboard');
  const [searchQuery] = useState('');
  const [viewMode, setViewMode] = useState('Revenue');
  const [warnings, setWarnings] = useState([]);
  
  // Overview & Assignment State
  const [selectedBooking, setSelectedBooking] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState({});

  // Editing Bookings
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    guestName: '',
    pickupLocation: '',
    dropoffLocation: '',
    pickupTime: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Driver Approvals
  const [pendingDriversList, setPendingDriversList] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  // Vehicles
  const [selectedMake, setSelectedMake] = useState('Toyota');

  useEffect(() => {
    loadData();
    loadPendingDrivers();
  }, [loadData]);

  const filteredBookings = bookings.filter(
    (b) =>
      !searchQuery ||
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.dropoffLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pendingBookings = bookings.filter((b) => b.status === 'Pending' && !b.driver);
  const availableDrivers = drivers.filter((d) => d.availability);

  const statusCls = (s) => {
    if (s === 'Pending') return 'status-badge pending';
    if (s === 'Confirmed') return 'status-badge confirmed';
    if (s === 'Completed') return 'status-badge completed';
    return 'status-badge on-way';
  };

  useEffect(() => {
    const newWarnings = [];
    const unassigned = bookings.filter((b) => b.status === 'Pending' && !b.driver);
    if (unassigned.length > 0) {
      newWarnings.push({
        id: 'unassigned',
        type: 'error',
        message: `⚠️ ${unassigned.length} booking${unassigned.length > 1 ? 's' : ''} need${unassigned.length === 1 ? 's' : ''} driver assignment!`,
        detail: `Pending: ${unassigned.map((b) => b.guestName).join(', ')}`,
      });
    }

    if (availableDrivers.length < 2 && drivers.length > 0) {
      newWarnings.push({
        id: 'low-drivers',
        type: 'warning',
        message: `⚠️ Low driver availability — only ${availableDrivers.length} available`,
        detail: 'Consider adding more drivers or releasing current ones.',
      });
    }

    if (vehicles.length === 0) {
      newWarnings.push({
        id: 'no-vehicles',
        type: 'error',
        message: '⚠️ No vehicles found in database!',
        detail: 'Add vehicles to allow guests to make bookings.',
      });
    }

    const unassignedCount = bookings.filter((b) => b.status === 'Pending').length;
    if (unassignedCount >= 5) {
      newWarnings.push({
        id: 'overload',
        type: 'warning',
        message: `⚠️ High load — ${unassignedCount} pending requests are queued!`,
        detail: 'Assign drivers quickly to avoid guest delays.',
      });
    }
    setWarnings(newWarnings);
  }, [bookings, drivers, vehicles, availableDrivers.length]);

  const dismissWarning = (id) => setWarnings((w) => w.filter((x) => x.id !== id));

  const loadPendingDrivers = async () => {
    try {
      const res = await getPendingDrivers();
      setPendingDriversList(res.data);
    } catch (err) {
      console.error('Failed to load pending drivers:', err);
    }
  };

  const handleApproveDriver = async (id) => {
    setApprovingId(id);
    try {
      await approveDriver(id);
      await loadPendingDrivers();
      await loadData();
    } catch {
      alert('Failed to approve driver');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectDriver = async (id) => {
    setRejectingId(id);
    try {
      await rejectDriver(id);
      await loadPendingDrivers();
    } catch {
      alert('Failed to reject driver');
    } finally {
      setRejectingId(null);
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createDriver({
        name: fd.get('name'),
        licenseNumber: fd.get('licenseNumber'),
        contact: fd.get('contact'),
        availability: true,
      });
      await loadData();
      e.currentTarget.reset();
    } catch {
      alert('Failed to add driver');
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await createVehicle({
        make: fd.get('make'),
        model: fd.get('model'),
        year: Number(fd.get('year')),
        type: fd.get('type'),
        plateNumber: fd.get('plateNumber'),
        capacity: Number(fd.get('capacity')),
        status: 'Available',
      });
      await loadData();
      e.currentTarget.reset();
    } catch (err) {
      alert(`Failed to add vehicle: ${err?.response?.data?.message || err?.message || 'Unknown error'}`);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
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

  const toDatetimeLocal = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 16);
  };

  const handleOpenEditBooking = (b) => {
    setEditDraft({
      guestName: b.guestName ?? '',
      pickupLocation: b.pickupLocation ?? '',
      dropoffLocation: b.dropoffLocation ?? '',
      pickupTime: toDatetimeLocal(b.pickupTime),
    });
    setEditingBookingId(b._id);
  };

  const handleDeleteBooking = async (bookingId) => {
    const ok = window.confirm('Delete this booking?');
    if (!ok) return;
    try {
      await deleteBooking(bookingId);
      await loadData();
    } catch {
      alert('Failed to delete booking.');
    }
  };

  const handleSaveEditBooking = async () => {
    if (!editingBookingId) return;
    setSavingEdit(true);
    try {
      await updateBooking(editingBookingId, {
        guestName: editDraft.guestName,
        pickupLocation: editDraft.pickupLocation,
        dropoffLocation: editDraft.dropoffLocation,
        pickupTime: new Date(editDraft.pickupTime).toISOString(),
      });
      setEditingBookingId(null);
      await loadData();
    } catch {
      alert('Failed to update booking.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedBooking || !selectedDriver || !selectedVehicle) return;
    setAssigning(true);
    try {
      await assignBooking(selectedBooking, { driverId: selectedDriver, vehicleId: selectedVehicle });
      await loadData();
      setAssignSuccess(true);
      setSelectedBooking('');
      setSelectedDriver('');
      setSelectedVehicle('');
      setTimeout(() => setAssignSuccess(false), 3000);
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.response?.data?.message || 'Assignment failed. Check availability.';
      alert(msg);
    } finally {
      setAssigning(false);
    }
  };

  const handleAutoAssign = async () => {
    const pending = pendingBookings;
    const driversPool = [...availableDrivers];
    const vehiclesPool = vehicles.filter((v) => v.status === 'Available');

    if (pending.length === 0) return alert('No pending unassigned bookings.');
    if (driversPool.length === 0 || vehiclesPool.length === 0)
      return alert('Need at least one available driver and one available vehicle.');

    const assignCount = Math.min(pending.length, driversPool.length, vehiclesPool.length);
    setAutoAssigning(true);

    try {
      for (let i = 0; i < assignCount; i += 1) {
        await assignBooking(pending[i]._id, {
          driverId: driversPool[i]._id,
          vehicleId: vehiclesPool[i]._id,
        });
      }
      await loadData();
      setAssignSuccess(true);
      setTimeout(() => setAssignSuccess(false), 3000);
      if (pending.length > assignCount) {
        alert(`Auto-assigned ${assignCount} booking(s). ${pending.length - assignCount} still pending.`);
      }
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.response?.data?.message || 'Auto assignment failed.';
      alert(msg);
    } finally {
      setAutoAssigning(false);
    }
  };

  return (
    <div className="animate-fade-in pb-12" style={{ color: '#f1f5f9' }}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
            <div className="flex items-center gap-3">
                <Car className="w-8 h-8 text-indigo-400" />
                <h1 className="text-3xl font-extrabold">Guest Transport Management</h1>
            </div>
            <p className="mt-1 text-gray-400">Track and manage guest transportation in real-time.</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-700 pb-2 overflow-x-auto">
        {['dashboard', 'bookings', 'drivers', 'vehicles', 'approvals', 'reports'].map(tab => (
           <button 
             key={tab} 
             onClick={() => setActiveNav(tab)}
             className={`px-4 py-2 capitalize font-semibold rounded-t-lg transition ${activeNav === tab ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
           >
             {tab}
           </button>
        ))}
      </div>

      {/* Edit Booking Modal */}
      {editingBookingId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              width: 520,
              maxWidth: '95vw',
              background: '#0f172a',
              borderRadius: 14,
              padding: 18,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              border: '1px solid rgba(148,163,184,0.1)',
              color: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 900, color: '#ffffff' }}>Edit Booking</div>
              <button
                onClick={() => setEditingBookingId(null)}
                className="btn-outline"
                style={{ fontSize: '0.75rem', height: 30, padding: '0 10px' }}
              >
                <X size={14} />
              </button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label className="form-label block text-sm font-semibold mb-1">Guest Name</label>
                <input
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                  value={editDraft.guestName}
                  onChange={(e) => setEditDraft((p) => ({ ...p, guestName: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label block text-sm font-semibold mb-1">Pickup Location</label>
                <input
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                  value={editDraft.pickupLocation}
                  onChange={(e) => setEditDraft((p) => ({ ...p, pickupLocation: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label block text-sm font-semibold mb-1">Drop-off Location</label>
                <input
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                  value={editDraft.dropoffLocation}
                  onChange={(e) => setEditDraft((p) => ({ ...p, dropoffLocation: e.target.value }))}
                />
              </div>
              <div>
                <label className="form-label block text-sm font-semibold mb-1">Pickup Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                  value={editDraft.pickupTime}
                  onChange={(e) => setEditDraft((p) => ({ ...p, pickupTime: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                className="px-4 py-2 border border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-800"
                onClick={() => setEditingBookingId(null)}
                disabled={savingEdit}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                onClick={() => void handleSaveEditBooking()}
                disabled={savingEdit || !editDraft.pickupTime}
              >
                {savingEdit ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.map((w) => (
        <div
          key={w.id}
          className="warning-banner"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 10,
            marginBottom: 10,
            fontSize: '0.82rem',
            background: w.type === 'error' ? '#450a0a' : w.type === 'warning' ? '#422006' : '#172554',
            border: `1px solid ${w.type === 'error' ? '#7f1d1d' : w.type === 'warning' ? '#713f12' : '#1e3a8a'}`,
            color: w.type === 'error' ? '#fca5a5' : w.type === 'warning' ? '#fde047' : '#93c5fd',
          }}
        >
          <AlertCircle size={16} />
          <div style={{ flex: 1 }}>
            <strong>{w.message}</strong>
            {w.detail && <p style={{ marginTop: 2, opacity: 0.8, fontSize: '0.75rem' }}>{w.detail}</p>}
          </div>
          <button
            onClick={() => dismissWarning(w.id)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6, color: 'currentColor' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Render Active View */}
      <div className="mt-4">
        {activeNav === 'dashboard' && (
          <OverviewPanel
            bookings={bookings}
            filteredBookings={filteredBookings}
            pendingBookings={pendingBookings}
            availableDrivers={availableDrivers}
            drivers={drivers}
            vehicles={vehicles}
            setActiveNav={setActiveNav}
            statusCls={statusCls}
            statusUpdating={statusUpdating}
            handleStatusUpdate={handleStatusUpdate}
            handleOpenEditBooking={handleOpenEditBooking}
            handleDeleteBooking={handleDeleteBooking}
            selectedBooking={selectedBooking}
            setSelectedBooking={setSelectedBooking}
            selectedDriver={selectedDriver}
            setSelectedDriver={setSelectedDriver}
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            assigning={assigning}
            assignSuccess={assignSuccess}
            handleAssign={handleAssign}
            autoAssigning={autoAssigning}
            handleAutoAssign={handleAutoAssign}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        )}
        
        {activeNav === 'bookings' && (
          <BookingsPanel
            bookings={filteredBookings}
            statusCls={statusCls}
            handleOpenEditBooking={handleOpenEditBooking}
            handleDeleteBooking={handleDeleteBooking}
          />
        )}
        
        {activeNav === 'drivers' && <DriversPanel drivers={drivers} handleAddDriver={handleAddDriver} />}
        
        {activeNav === 'vehicles' && (
          <VehiclesPanel
            vehicles={vehicles}
            handleAddVehicle={handleAddVehicle}
            selectedMake={selectedMake}
            setSelectedMake={setSelectedMake}
          />
        )}
        
        {activeNav === 'approvals' && (
          <ApprovalsPanel
            pendingDriversList={pendingDriversList}
            approvingId={approvingId}
            rejectingId={rejectingId}
            handleApproveDriver={handleApproveDriver}
            handleRejectDriver={handleRejectDriver}
          />
        )}
        
        {activeNav === 'reports' && <ReportsPanel />}
      </div>
    </div>
  );
}
