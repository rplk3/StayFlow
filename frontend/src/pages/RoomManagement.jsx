import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit3, Trash2, Star, X, DoorOpen, ChevronLeft, ChevronRight, Wrench, CheckCircle, XCircle, Users } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/admin/rooms';

const emptyForm = {
    hotelId: '', roomNumber: '', roomType: 'Standard', capacity: 2, floor: 1,
    description: '', amenities: '', totalRooms: 1, basePrice: 5000, status: 'available'
};

const statusConfig = {
    available: { label: 'Available', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    occupied: { label: 'Occupied', bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
    maintenance: { label: 'Maintenance', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
    unavailable: { label: 'Unavailable', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' }
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
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

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
            setError(err.response?.data?.message || 'Failed to fetch rooms');
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
        setError('');
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
        setError('');
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

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
                setSuccessMsg('Room updated successfully!');
            } else {
                await axios.post(API_BASE, payload, { headers });
                setSuccessMsg('Room created successfully!');
            }
            setShowModal(false);
            fetchRooms();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save room');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, roomNumber) => {
        if (!window.confirm(`Delete room "${roomNumber}"?`)) return;
        try {
            await axios.delete(`${API_BASE}/${id}`, { headers });
            setSuccessMsg('Room deleted!');
            fetchRooms();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete room');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.put(`${API_BASE}/${id}/status`, { status: newStatus }, { headers });
            setStatusDropdown(null);
            fetchRooms();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071C2] focus:border-transparent outline-none transition text-sm";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <DoorOpen className="w-8 h-8 text-[#0071C2]" />
                        <h1 className="text-3xl font-extrabold text-[#1E3A8A]">Room Management</h1>
                    </div>
                    <p className="text-gray-500 mt-1"><span className="font-semibold text-gray-700">{total}</span> rooms total</p>
                </div>
                <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 bg-[#0071C2] text-white rounded-lg font-semibold text-sm hover:bg-[#005999] transition-all hover:-translate-y-0.5 shadow-md">
                    <Plus size={18} /> Add Room
                </button>
            </div>

            {successMsg && (
                <div className="p-4 mb-4 rounded-lg bg-green-50 text-green-800 border-l-4 border-green-500 text-sm font-medium shadow-sm">{successMsg}</div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search by room number or type..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071C2] focus:border-transparent outline-none text-sm" />
                </form>
                <select value={hotelFilter} onChange={(e) => { setHotelFilter(e.target.value); setPage(1); }} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071C2] outline-none text-sm bg-white min-w-[200px]">
                    <option value="">All Hotels</option>
                    {hotels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071C2] outline-none text-sm bg-white min-w-[160px]">
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071C2]"></div>
                    <span className="ml-3 text-gray-500">Loading rooms...</span>
                </div>
            ) : rooms.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                    <DoorOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Rooms Found</h3>
                    <p className="text-gray-400">Try adjusting filters or add a new room.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Room</th>
                                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hotel</th>
                                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Capacity</th>
                                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {rooms.map((room) => {
                                const sc = statusConfig[room.status] || statusConfig.available;
                                return (
                                    <tr key={room._id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#003B95] to-[#0071C2] flex items-center justify-center text-white font-bold text-sm mr-3 shadow-sm flex-shrink-0">
                                                    {room.roomNumber || '#'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">Room {room.roomNumber}</div>
                                                    <div className="text-xs text-gray-400">Floor {room.floor || '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {room.hotelId?.name || 'Unknown'}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                                                {room.roomType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Users size={14} /> {room.capacity}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-semibold text-gray-800">
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
                                                <div className="absolute z-20 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-xl py-1">
                                                    {Object.entries(statusConfig).map(([key, cfg]) => (
                                                        <button key={key} onClick={() => handleStatusChange(room._id, key)} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${room.status === key ? 'font-bold' : ''}`}>
                                                            <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span> {cfg.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(room)} className="p-2 rounded-lg hover:bg-blue-100 transition" title="Edit">
                                                    <Edit3 size={18} className="text-blue-600" />
                                                </button>
                                                <button onClick={() => handleDelete(room._id, room.roomNumber)} className="p-2 rounded-lg hover:bg-red-100 transition" title="Delete">
                                                    <Trash2 size={18} className="text-red-500" />
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
                    <p className="text-sm text-gray-500">Page {page} of {totalPages} ({total} rooms)</p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition">
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition">
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                            <h2 className="text-2xl font-bold text-[#1E3A8A]">{editing ? 'Edit Room' : 'Add New Room'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={20} className="text-gray-500" /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>}

                            {/* Hotel Selection */}
                            <div>
                                <label className={labelClass}>Hotel *</label>
                                <select value={form.hotelId} onChange={(e) => setForm({ ...form, hotelId: e.target.value })} required className={inputClass}>
                                    <option value="">Select a hotel</option>
                                    {hotels.map(h => <option key={h._id} value={h._id}>{h.name} — {h.destination}</option>)}
                                </select>
                            </div>

                            {/* Room Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Room Number</label>
                                    <input type="text" value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} className={inputClass} placeholder="e.g. 301" />
                                </div>
                                <div>
                                    <label className={labelClass}>Room Type *</label>
                                    <select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })} className={inputClass}>
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
                                    <input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className={inputClass} min="1" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Capacity (guests)</label>
                                    <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className={inputClass} min="1" />
                                </div>
                                <div>
                                    <label className={labelClass}>Total Rooms *</label>
                                    <input type="number" value={form.totalRooms} onChange={(e) => setForm({ ...form, totalRooms: e.target.value })} required className={inputClass} min="1" />
                                </div>
                                <div>
                                    <label className={labelClass}>Base Price (LKR) *</label>
                                    <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} required className={inputClass} min="0" />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Status</label>
                                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                                    <option value="available">Available</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="maintenance">Under Maintenance</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-20 resize-none`} placeholder="Room description..." />
                            </div>

                            <div>
                                <label className={labelClass}>Amenities <span className="text-gray-400 font-normal">(comma separated)</span></label>
                                <input type="text" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className={inputClass} placeholder="TV, Air Conditioning, Mini Bar" />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                                <button type="submit" disabled={saving} className="px-8 py-3 rounded-lg bg-[#0071C2] text-white text-sm font-bold hover:bg-[#005999] transition-all disabled:opacity-50 shadow-md hover:-translate-y-0.5">
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
