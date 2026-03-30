import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit3, Trash2, Star, X, DoorOpen, ChevronLeft, ChevronRight, Wrench, CheckCircle, XCircle, Users } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = 'http://localhost:5000/api/admin/rooms';
const dk = { bg: '#0f1117', card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8' };

const emptyForm = {
    hotelId: '', roomNumber: '', roomType: 'Standard', capacity: 2, floor: 1,
    description: '', amenities: '', totalRooms: 1, basePrice: 5000, status: 'available'
};

const statusConfig = {
    available: { label: 'Available', bg: 'bg-green-900/30', text: 'text-green-400 border border-green-500/30', dot: 'bg-green-400' },
    occupied: { label: 'Occupied', bg: 'bg-indigo-900/30', text: 'text-indigo-400 border border-indigo-500/30', dot: 'bg-indigo-400' },
    maintenance: { label: 'Maintenance', bg: 'bg-yellow-900/30', text: 'text-yellow-400 border border-yellow-500/30', dot: 'bg-yellow-400' },
    unavailable: { label: 'Unavailable', bg: 'bg-red-900/30', text: 'text-red-400 border border-red-500/30', dot: 'bg-red-400' }
};

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [hotelFilter, setHotelFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [hotels, setHotels] = useState([]);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);

    // Status dropdown
    const [statusDropdown, setStatusDropdown] = useState(null);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (hotelFilter) params.hotelId = hotelFilter;
            const res = await axios.get(API_BASE, { headers, params });
            setRooms(res.data.rooms);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to fetch rooms', icon: 'error', background: dk.card, color: dk.text });
        } finally {
            setLoading(false);
        }
    };

    const fetchHotels = async () => {
        try {
            const res = await axios.get(`${API_BASE}/hotels-list`, { headers });
            setHotels(res.data);
        } catch (err) {
            console.error('Failed to fetch hotels list');
        }
    };

    useEffect(() => { fetchHotels(); }, []);
    useEffect(() => { fetchRooms(); }, [page, statusFilter, hotelFilter]);

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchRooms(); };

    const openAddModal = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowModal(true);
    };

    const openEditModal = (room) => {
        setEditing(room._id);
        setForm({
            hotelId: room.hotelId?._id || room.hotelId || '',
            roomNumber: room.roomNumber || '',
            roomType: room.roomType || 'Standard',
            capacity: room.capacity || 2,
            floor: room.floor || 1,
            description: room.description || '',
            amenities: (room.amenities || []).join(', '),
            totalRooms: room.totalRooms || 1,
            basePrice: room.basePrice || 5000,
            status: room.status || 'available'
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const payload = {
            ...form,
            capacity: parseInt(form.capacity),
            floor: parseInt(form.floor),
            totalRooms: parseInt(form.totalRooms),
            basePrice: parseFloat(form.basePrice),
            amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : []
        };

        try {
            if (editing) {
                await axios.put(`${API_BASE}/${editing}`, payload, { headers });
                Swal.fire({ title: 'Updated!', text: 'Room updated successfully.', icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
            } else {
                await axios.post(API_BASE, payload, { headers });
                Swal.fire({ title: 'Created!', text: 'Room created successfully!', icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
            }
            setShowModal(false);
            fetchRooms();
        } catch (err) {
            Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to save room', icon: 'error', background: dk.card, color: dk.text });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, roomNumber) => {
        const result = await Swal.fire({
            title: 'Delete Room?',
            text: `Are you sure you want to delete room "${roomNumber}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Yes, delete it!',
            background: dk.card,
            color: dk.text
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE}/${id}`, { headers });
                Swal.fire({ title: 'Deleted!', text: 'Room deleted successfully.', icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
                fetchRooms();
            } catch (err) {
                Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to delete room', icon: 'error', background: dk.card, color: dk.text });
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.put(`${API_BASE}/${id}/status`, { status: newStatus }, { headers });
            setStatusDropdown(null);
            fetchRooms();
        } catch (err) {
            Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to update status', icon: 'error', background: dk.card, color: dk.text });
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm border";
    const labelClass = "block text-xs font-bold uppercase tracking-wider mb-2 mt-4 text-gray-400";

    return (
        <div className="animate-fade-in pb-12" style={{ color: dk.text }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <DoorOpen className="w-8 h-8 text-indigo-400" />
                        <h1 className="text-3xl font-extrabold">Room Management</h1>
                    </div>
                    <p className="mt-1" style={{ color: dk.textSec }}><span className="font-semibold text-white">{total}</span> rooms total</p>
                </div>
                <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold text-sm transition-all hover:-translate-y-0.5 shadow-md" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <Plus size={18} /> Add Room
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="text" placeholder="Search by room number or type..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                </form>
                <select value={hotelFilter} onChange={(e) => { setHotelFilter(e.target.value); setPage(1); }} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-w-[200px]" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                    <option value="">All Hotels</option>
                    {hotels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-w-[160px]" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                    <option value="">All Status</option>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    <span className="ml-3" style={{ color: dk.textSec }}>Loading rooms...</span>
                </div>
            ) : rooms.length === 0 ? (
                <div className="text-center py-16 rounded-xl border" style={{ background: dk.card, borderColor: dk.border }}>
                    <DoorOpen className="w-16 h-16 text-indigo-500/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Rooms Found</h3>
                    <p style={{ color: dk.textSec }}>Try adjusting filters or add a new room.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border shadow-sm" style={{ background: dk.card, borderColor: dk.border }}>
                    <table className="min-w-full divide-y" style={{ divideColor: dk.border }}>
                        <thead style={{ background: dk.elevated }}>
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Room</th>
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Hotel</th>
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Type</th>
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Capacity</th>
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Price</th>
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Status</th>
                                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ divideColor: dk.border }}>
                            {rooms.map((room) => {
                                const sc = statusConfig[room.status] || statusConfig.available;
                                return (
                                    <tr key={room._id} className="transition-colors hover:bg-white/5">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm mr-3 shadow-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                                    {room.roomNumber || '#'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">Room {room.roomNumber}</div>
                                                    <div className="text-xs" style={{ color: dk.textSec }}>Floor {room.floor || '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm" style={{ color: dk.textSec }}>
                                            {room.hotelId?.name || 'Unknown'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-900/30 text-indigo-400 border border-indigo-500/20">
                                                {room.roomType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-400">
                                                <Users size={14} /> {room.capacity}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-semibold text-white">
                                            LKR {room.basePrice?.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-4 relative">
                                            <button
                                                onClick={() => setStatusDropdown(statusDropdown === room._id ? null : room._id)}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 transition ${sc.bg} ${sc.text}`}
                                            >
                                                <span className={`w-2 h-2 rounded-full mr-1.5 ${sc.dot}`}></span>
                                                {sc.label}
                                            </button>
                                            {statusDropdown === room._id && (
                                                <div className="absolute z-20 mt-1 w-40 border rounded-lg shadow-xl py-1" style={{ background: dk.elevated, borderColor: dk.border }}>
                                                    {Object.entries(statusConfig).map(([key, cfg]) => (
                                                        <button key={key} onClick={() => handleStatusChange(room._id, key)} className={`w-full text-left px-4 py-2 text-sm hover:bg-white/5 flex items-center gap-2 ${room.status === key ? 'font-bold text-white' : 'text-gray-400'}`}>
                                                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span> {cfg.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(room)} className="p-2 rounded-lg hover:bg-indigo-500/20 transition" title="Edit">
                                                    <Edit3 size={18} className="text-indigo-400" />
                                                </button>
                                                <button onClick={() => handleDelete(room._id, room.roomNumber)} className="p-2 rounded-lg hover:bg-red-500/20 transition" title="Delete">
                                                    <Trash2 size={18} className="text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm" style={{ color: dk.textSec }}>Page {page} of {totalPages} ({total} rooms)</p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition" style={{ borderColor: dk.border, background: dk.card }}>
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition" style={{ borderColor: dk.border, background: dk.card }}>
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: dk.card, border: `1px solid ${dk.border}` }}>
                        <div className="flex items-center justify-between px-8 py-5 border-b sticky top-0 rounded-t-2xl z-10" style={{ background: dk.card, borderColor: dk.border }}>
                            <h2 className="text-2xl font-bold text-white">{editing ? 'Edit Room' : 'Add New Room'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition" style={{ color: dk.textSec }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-4">
                            {/* Hotel Selection */}
                            <div>
                                <label className={labelClass}>Hotel *</label>
                                <select value={form.hotelId} onChange={(e) => setForm({ ...form, hotelId: e.target.value })} required className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                                    <option value="">Select a hotel</option>
                                    {hotels.map(h => <option key={h._id} value={h._id}>{h.name} — {h.destination}</option>)}
                                </select>
                            </div>

                            {/* Room Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Room Number</label>
                                    <input type="text" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} className={inputClass} placeholder="e.g. 301" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                                </div>
                                <div>
                                    <label className={labelClass}>Room Type *</label>
                                    <select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                                        <option value="Standard">Standard</option>
                                        <option value="Deluxe">Deluxe</option>
                                        <option value="Suite">Suite</option>
                                        <option value="Penthouse">Penthouse</option>
                                        <option value="Family">Family</option>
                                        <option value="Twin">Twin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Floor</label>
                                    <input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className={inputClass} min="1" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Capacity (guests)</label>
                                    <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className={inputClass} min="1" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                                </div>
                                <div>
                                    <label className={labelClass}>Total Rooms *</label>
                                    <input type="number" value={form.totalRooms} onChange={(e) => setForm({ ...form, totalRooms: e.target.value })} required className={inputClass} min="1" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                                </div>
                                <div>
                                    <label className={labelClass}>Base Price (LKR) *</label>
                                    <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required className={inputClass} min="0" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Status</label>
                                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                                    <option value="available">Available</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="maintenance">Under Maintenance</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-20 resize-none`} placeholder="Room description..." style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                            </div>

                            <div>
                                <label className={labelClass}>Amenities</label>
                                <input type="text" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className={inputClass} placeholder="TV, Air Conditioning, Mini Bar" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t" style={{ borderColor: dk.border }}>
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-lg border text-sm font-semibold transition hover:bg-white/5" style={{ borderColor: dk.border, color: dk.text }}>Cancel</button>
                                <button type="submit" disabled={saving} className="px-8 py-3 rounded-lg text-white text-sm font-bold transition-all disabled:opacity-50 shadow-md hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                    {saving ? 'Saving...' : editing ? 'Update Room' : 'Create Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;
