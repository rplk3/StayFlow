import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit3, Trash2, Star, X, DoorOpen, ChevronLeft, ChevronRight, Wrench, CheckCircle, XCircle, Users, List, Send, Eye, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = 'http://localhost:5000/api/admin/rooms';
const API_BOOKINGS = 'http://localhost:5000/api/admin/hotel-bookings';

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

const bStatusConfig = {
    HOLD: { label: 'Hold', bg: 'bg-yellow-900/30', text: 'text-yellow-400 border border-yellow-500/30' },
    CONFIRMED: { label: 'Confirmed', bg: 'bg-green-900/30', text: 'text-green-400 border border-green-500/30' },
    FORWARDED: { label: 'Forwarded', bg: 'bg-blue-900/30', text: 'text-blue-400 border border-blue-500/30' },
    CANCELLED: { label: 'Cancelled', bg: 'bg-red-900/30', text: 'text-red-400 border border-red-500/30' },
    NO_SHOW: { label: 'No Show', bg: 'bg-gray-900/30', text: 'text-gray-400 border border-gray-500/30' }
};

const RoomManagement = () => {
    const [activeTab, setActiveTab] = useState('rooms'); // rooms | bookings
    const [hotels, setHotels] = useState([]);

    // --- Rooms State ---
    const [rooms, setRooms] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [hotelFilter, setHotelFilter] = useState('');
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [statusDropdown, setStatusDropdown] = useState(null);

    // --- Bookings State ---
    const [bookings, setBookings] = useState([]);
    const [totalBookings, setTotalBookings] = useState(0);
    const [bookingPage, setBookingPage] = useState(1);
    const [bookingPages, setBookingPages] = useState(1);
    const [bookingSearch, setBookingSearch] = useState('');
    const [bookingStatusFilter, setBookingStatusFilter] = useState('');
    const [bookingHotelFilter, setBookingHotelFilter] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchHotels = async () => {
        try {
            const res = await axios.get(`${API_BASE}/hotels-list`, { headers });
            setHotels(res.data);
        } catch (err) { console.error('Failed to fetch hotels list'); }
    };

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (hotelFilter) params.hotelId = hotelFilter;
            const res = await axios.get(API_BASE, { headers, params });
            setRooms(res.data.rooms); setTotal(res.data.total); setTotalPages(res.data.totalPages);
        } catch (err) { } finally { setLoading(false); }
    };

    const fetchBookings = async () => {
        try {
            setBookingLoading(true);
            const params = { page: bookingPage, limit: 15 };
            if (bookingSearch) params.search = bookingSearch;
            if (bookingStatusFilter) params.status = bookingStatusFilter;
            if (bookingHotelFilter) params.hotelId = bookingHotelFilter;
            const res = await axios.get(API_BOOKINGS, { headers, params });
            setBookings(res.data.bookings); setTotalBookings(res.data.total); setBookingPages(res.data.totalPages);
        } catch (err) { } finally { setBookingLoading(false); }
    };

    useEffect(() => { fetchHotels(); }, []);
    useEffect(() => { if (activeTab === 'rooms') fetchRooms(); }, [page, statusFilter, hotelFilter, activeTab]);
    useEffect(() => { if (activeTab === 'bookings') fetchBookings(); }, [bookingPage, bookingStatusFilter, bookingHotelFilter, activeTab]);

    const handleSearchRooms = (e) => { e.preventDefault(); setPage(1); fetchRooms(); };
    const handleSearchBookings = (e) => { e.preventDefault(); setBookingPage(1); fetchBookings(); };

    // --- Rooms CRUD ---
    const openAddModal = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
    const openEditModal = (room) => {
        setEditing(room._id);
        setForm({
            hotelId: room.hotelId?._id || room.hotelId || '', roomNumber: room.roomNumber || '',
            roomType: room.roomType || 'Standard', capacity: room.capacity || 2, floor: room.floor || 1,
            description: room.description || '', amenities: (room.amenities || []).join(', '), totalRooms: room.totalRooms || 1,
            basePrice: room.basePrice || 5000, status: room.status || 'available'
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault(); setSaving(true);
        const payload = { ...form, capacity: parseInt(form.capacity), floor: parseInt(form.floor), totalRooms: parseInt(form.totalRooms), basePrice: parseFloat(form.basePrice), amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [] };
        try {
            if (editing) await axios.put(`${API_BASE}/${editing}`, payload, { headers });
            else await axios.post(API_BASE, payload, { headers });
            Swal.fire({ title: 'Success!', text: 'Room saved.', icon: 'success', background: dk.card, color: dk.text, timer: 1500, showConfirmButton: false });
            setShowModal(false); fetchRooms();
        } catch (err) { Swal.fire({ title: 'Error', text: 'Failed to save room', icon: 'error', background: dk.card, color: dk.text }); }
        finally { setSaving(false); }
    };

    const handleDeleteRoom = async (id, roomNumber) => {
        const res = await Swal.fire({ title: 'Delete Room?', text: `Delete room ${roomNumber}?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#3b82f6', confirmButtonText: 'Delete!', background: dk.card, color: dk.text });
        if (res.isConfirmed) {
            try { await axios.delete(`${API_BASE}/${id}`, { headers }); fetchRooms(); } catch (err) { }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try { await axios.put(`${API_BASE}/${id}/status`, { status: newStatus }, { headers }); setStatusDropdown(null); fetchRooms(); } catch (err) { }
    };

    // --- Bookings Actions ---
    const updateBookingStatus = async (id, status, successText) => {
        try {
            await axios.put(`${API_BOOKINGS}/${id}/status`, { status }, { headers });
            Swal.fire({ title: 'Success!', text: successText, icon: 'success', background: dk.card, color: dk.text, timer: 1500, showConfirmButton: false });
            if (selectedBooking && selectedBooking._id === id) {
                // refresh selected booking locally
                setSelectedBooking({ ...selectedBooking, status });
            }
            fetchBookings();
        } catch (err) { Swal.fire({ title: 'Error', text: err.response?.data?.message || 'Update failed', icon: 'error', background: dk.card, color: dk.text }); }
    };

    const deleteBooking = async (id) => {
        const res = await Swal.fire({ title: 'Delete Booking Record?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#3b82f6', confirmButtonText: 'Delete', background: dk.card, color: dk.text });
        if (res.isConfirmed) {
            try { 
                await axios.delete(`${API_BOOKINGS}/${id}`, { headers }); 
                setSelectedBooking(null);
                fetchBookings(); 
            } catch (err) { }
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm border";
    const labelClass = "block text-xs font-bold uppercase tracking-wider mb-2 mt-4 text-gray-400";

    return (
        <div className="animate-fade-in pb-12" style={{ color: dk.text }}>
            
            {/* Header block with Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b pb-6" style={{ borderColor: dk.border }}>
                <div className="flex items-center gap-3">
                    <DoorOpen className="w-8 h-8 text-indigo-400" />
                    <div>
                        <h1 className="text-3xl font-extrabold text-white">Hotel Management</h1>
                        <p className="mt-1 text-sm" style={{ color: dk.textSec }}>Manage your physical rooms and guest reservations</p>
                    </div>
                </div>
                
                {/* TABS */}
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('rooms')} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm ${activeTab === 'rooms' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5 border'}`} style={{ borderColor: activeTab === 'rooms' ? 'transparent' : dk.border }}>
                        <DoorOpen size={16} /> Rooms
                    </button>
                    <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm ${activeTab === 'bookings' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5 border'}`} style={{ borderColor: activeTab === 'bookings' ? 'transparent' : dk.border }}>
                        <List size={16} /> Bookings
                    </button>
                </div>
            </div>

            {/* ================= ROOMS TAB ================= */}
            {activeTab === 'rooms' && (
                <>
                    <div className="flex justify-end mb-4">
                        <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg font-semibold text-sm transition-all hover:-translate-y-0.5 shadow-md" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            <Plus size={18} /> Add Room
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                        <form onSubmit={handleSearchRooms} className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input type="text" placeholder="Search by room number or type..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                        </form>
                        <select value={hotelFilter} onChange={(e) => { setHotelFilter(e.target.value); setPage(1); }} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-w-[200px]" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                            <option value="">All Hotels</option>
                            {hotels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                        </select>
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-w-[160px]" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                            <option value="">All Status</option>
                            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="text-center py-16 rounded-xl border" style={{ background: dk.card, borderColor: dk.border }}>
                            <h3 className="text-xl font-semibold text-white mb-2">No Rooms Found</h3>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border shadow-sm" style={{ background: dk.card, borderColor: dk.border }}>
                            <table className="min-w-full divide-y" style={{ divideColor: dk.border }}>
                                <thead style={{ background: dk.elevated }}>
                                    <tr>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Room</th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Hotel</th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Type</th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Price</th>
                                        <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                                        <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: dk.border }}>
                                    {rooms.map((room) => {
                                        const sc = statusConfig[room.status] || statusConfig.available;
                                        return (
                                            <tr key={room._id} className="hover:bg-white/5 transition">
                                                <td className="px-5 py-4">
                                                    <div className="font-semibold text-white">Room {room.roomNumber}</div>
                                                </td>
                                                <td className="px-5 py-4 text-sm" style={{ color: dk.textSec || '#9ca3af' }}>{room.hotelId?.name}</td>
                                                <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-900/30 text-indigo-400 border border-indigo-500/20">{room.roomType}</span></td>
                                                <td className="px-5 py-4 text-sm font-semibold text-white">LKR {room.basePrice?.toLocaleString()}</td>
                                                <td className="px-5 py-4 relative">
                                                    <button onClick={() => setStatusDropdown(statusDropdown === room._id ? null : room._id)} className={`px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</button>
                                                    {statusDropdown === room._id && (
                                                        <div className="absolute z-20 mt-1 w-40 border rounded-lg shadow-xl py-1" style={{ background: dk.elevated, borderColor: dk.border }}>
                                                            {Object.entries(statusConfig).map(([key, cfg]) => (
                                                                <button key={key} onClick={() => handleStatusChange(room._id, key)} className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5">{cfg.label}</button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <button onClick={() => openEditModal(room)} className="p-2 rounded-lg hover:bg-indigo-500/20 text-indigo-400 mr-2"><Edit3 size={18} /></button>
                                                    <button onClick={() => handleDeleteRoom(room._id, room.roomNumber)} className="p-2 rounded-lg hover:bg-red-500/20 text-red-400"><Trash2 size={18} /></button>
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
                            <div className="flex gap-2 ml-auto">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-white/5" style={{ borderColor: dk.border }}><ChevronLeft size={16} /> Prev</button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-white/5" style={{ borderColor: dk.border }}>Next <ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ================= BOOKINGS TAB ================= */}
            {activeTab === 'bookings' && (
                <>
                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                        <form onSubmit={handleSearchBookings} className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input type="text" placeholder="Search by name, email, booking code..." value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                        </form>
                        <select value={bookingHotelFilter} onChange={(e) => { setBookingHotelFilter(e.target.value); setBookingPage(1); }} className="px-4 py-3 border rounded-lg text-sm min-w-[200px]" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                            <option value="">All Hotels</option>
                            {hotels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                        </select>
                        <select value={bookingStatusFilter} onChange={(e) => { setBookingStatusFilter(e.target.value); setBookingPage(1); }} className="px-4 py-3 border rounded-lg text-sm min-w-[160px]" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                            <option value="">All Statuses</option>
                            {Object.entries(bStatusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                    </div>

                    {bookingLoading ? (
                        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-16 rounded-xl border" style={{ background: dk.card, borderColor: dk.border }}>
                            <h3 className="text-xl font-semibold text-white mb-2">No Bookings Found</h3>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border shadow-sm" style={{ background: dk.card, borderColor: dk.border }}>
                            <table className="min-w-full divide-y" style={{ divideColor: dk.border }}>
                                <thead style={{ background: dk.elevated }}>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-400">Booking Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-400">Guest</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-400">Room Info</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-400">Dates</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-400">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-400">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: dk.border }}>
                                    {bookings.map(b => {
                                        const sc = bStatusConfig[b.status] || bStatusConfig.HOLD;
                                        return (
                                            <tr key={b._id} className="hover:bg-white/5 transition">
                                                <td className="px-4 py-3 font-mono text-sm text-indigo-400 font-bold">{b.bookingCode || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm text-white">{b.guestDetails?.firstName} {b.guestDetails?.lastName}</td>
                                                <td className="px-4 py-3 text-sm text-gray-300">
                                                    <div className="font-bold">{b.hotelId?.name}</div>
                                                    <div className="text-xs text-indigo-300">Room {b.roomId?.roomNumber} ({b.roomId?.roomType})</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-300">
                                                    {new Date(b.checkInDate).toLocaleDateString()} &rarr; {new Date(b.checkOutDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-bold text-white">Rs. {b.pricing?.totalAmount?.toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text} border`}>{sc.label}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => setSelectedBooking(b)} className="p-2 rounded-lg hover:bg-indigo-500/20 text-indigo-400 transition" title="View Details">
                                                        <Eye size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Booking Pagination */}
                    {bookingPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-400">Page {bookingPage} of {bookingPages}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setBookingPage(p => Math.max(1, p - 1))} disabled={bookingPage === 1} className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-white/5" style={{ borderColor: dk.border }}><ChevronLeft size={16} /></button>
                                <button onClick={() => setBookingPage(p => Math.min(bookingPages, p + 1))} disabled={bookingPage === bookingPages} className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-white/5" style={{ borderColor: dk.border }}><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Room modal keeping old logic */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: dk.card, border: `1px solid ${dk.border}` }}>
                        <div className="flex items-center justify-between px-8 py-5 border-b sticky top-0 rounded-t-2xl z-10" style={{ background: dk.card, borderColor: dk.border }}>
                            <h2 className="text-2xl font-bold text-white">{editing ? 'Edit Room' : 'Add New Room'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition" style={{ color: dk.textSec }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-4">
                            <div>
                                <label className={labelClass}>Hotel *</label>
                                <select value={form.hotelId} onChange={e => setForm({ ...form, hotelId: e.target.value })} required className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                                    <option value="">Select a hotel</option>
                                    {hotels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className={labelClass}>Room Number</label><input value={form.roomNumber} onChange={e => setForm({...form, roomNumber: e.target.value})} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}/></div>
                                <div><label className={labelClass}>Room Type *</label>
                                    <select value={form.roomType} onChange={e => setForm({...form, roomType: e.target.value})} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                                      <option value="Standard">Standard</option><option value="Deluxe">Deluxe</option><option value="Suite">Suite</option>
                                    </select>
                                </div>
                                <div><label className={labelClass}>Floor</label><input type="number" value={form.floor} onChange={e => setForm({...form, floor: e.target.value})} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}/></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className={labelClass}>Capacity</label><input type="number" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}/></div>
                                <div><label className={labelClass}>Total Rooms *</label><input type="number" value={form.totalRooms} onChange={e => setForm({...form, totalRooms: e.target.value})} className={inputClass} required style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}/></div>
                                <div><label className={labelClass}>Price (LKR) *</label><input type="number" value={form.basePrice} onChange={e => setForm({...form, basePrice: e.target.value})} className={inputClass} required style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}/></div>
                            </div>
                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={`${inputClass} h-20 resize-none`} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}/>
                            </div>
                            <div>
                                <label className={labelClass}>Amenities (comma sep)</label>
                                <input value={form.amenities} onChange={e => setForm({...form, amenities: e.target.value})} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}/>
                            </div>
                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t" style={{ borderColor: dk.border }}>
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg border text-sm font-bold text-white hover:bg-white/5" style={{ borderColor: dk.border }}>Cancel</button>
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 rounded-lg text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Room'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* selectedBooking Modal with Forward feature */}
            {selectedBooking && selectedBooking.guestDetails && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: dk.card, border: `1px solid ${dk.border}` }}>
                        <div className="flex items-center justify-between px-8 py-5 border-b sticky top-0 rounded-t-2xl z-10 bg-[#1a1d27]">
                            <h2 className="text-xl font-bold text-white">Hotel Booking Details</h2>
                            <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-white/10 rounded-lg"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="p-8 space-y-5">
                            <div className="flex gap-3 items-center">
                                <span className={`px-3 py-1.5 border rounded-full text-sm font-bold ${bStatusConfig[selectedBooking.status]?.bg} ${bStatusConfig[selectedBooking.status]?.text}`}>
                                    {bStatusConfig[selectedBooking.status]?.label}
                                </span>
                                <span className="font-mono text-indigo-400 font-bold">{selectedBooking.bookingCode}</span>
                            </div>

                            <div className="bg-indigo-900/10 p-4 rounded-xl border border-indigo-500/20 grid grid-cols-2 gap-4">
                                <div><span className="text-gray-400 text-xs text-uppercase block pb-1">Guest</span><p className="text-white font-semibold">{selectedBooking.guestDetails.firstName} {selectedBooking.guestDetails.lastName}</p></div>
                                <div><span className="text-gray-400 text-xs text-uppercase block pb-1">Email / Phone</span><p className="text-white font-semibold">{selectedBooking.guestDetails.email} • {selectedBooking.guestDetails.phone || 'N/A'}</p></div>
                                <div><span className="text-gray-400 text-xs text-uppercase block pb-1">Check-in</span><p className="text-white font-semibold">{new Date(selectedBooking.checkInDate).toLocaleDateString()}</p></div>
                                <div><span className="text-gray-400 text-xs text-uppercase block pb-1">Check-out</span><p className="text-white font-semibold">{new Date(selectedBooking.checkOutDate).toLocaleDateString()}</p></div>
                                <div><span className="text-gray-400 text-xs text-uppercase block pb-1">Hotel</span><p className="text-white font-semibold">{selectedBooking.hotelId?.name}</p></div>
                                <div><span className="text-gray-400 text-xs text-uppercase block pb-1">Room</span><p className="text-white font-semibold flex items-center gap-1"><DoorOpen size={14}/> {selectedBooking.roomId?.roomNumber} ({selectedBooking.roomId?.roomType})</p></div>
                            </div>
                            
                            <div className="rounded-xl p-5 text-white flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #4f46e5, #3b82f6)' }}>
                                <div><span className="font-bold text-lg block">Total Amount</span><span className="text-sm font-medium opacity-80">Payment default: {selectedBooking.paymentStatus}</span></div>
                                <span className="text-3xl font-extrabold">Rs. {selectedBooking.pricing?.totalAmount?.toLocaleString()}</span>
                            </div>

                            <div className="border-t pt-5 flex flex-wrap gap-2 justify-end" style={{ borderColor: dk.border }}>
                                {['HOLD', 'CANCELLED'].includes(selectedBooking.status) && (
                                    <button onClick={() => updateBookingStatus(selectedBooking._id, 'CONFIRMED', 'Booking confirmed.')} className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-green-700 flex items-center gap-2 transition">
                                        <CheckCircle size={16} /> Confirm Booking
                                    </button>
                                )}
                                
                                {['CONFIRMED'].includes(selectedBooking.status) && (
                                    <button onClick={() => updateBookingStatus(selectedBooking._id, 'FORWARDED', 'Booking forwarded to hotel backend successfully.')} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 flex items-center gap-2 transition">
                                        <Send size={16} /> Forward to Hotel
                                    </button>
                                )}

                                {['HOLD', 'CONFIRMED', 'FORWARDED'].includes(selectedBooking.status) && (
                                    <button onClick={() => updateBookingStatus(selectedBooking._id, 'CANCELLED', 'Booking Cancelled')} className="px-5 py-2.5 border border-red-500/30 bg-red-900/10 text-red-500 rounded-lg text-sm font-bold hover:bg-red-900/30 flex items-center gap-2 transition">
                                        <XCircle size={16} /> Cancel
                                    </button>
                                )}
                                
                                <button onClick={() => deleteBooking(selectedBooking._id)} className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-1 transition">
                                    <Trash2 size={16} /> Delete Record
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement;
