import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Eye, CheckCircle, XCircle, X, ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin, Trash2, Loader2, PartyPopper, Edit, List, Landmark } from 'lucide-react';
import Swal from 'sweetalert2';

const API = 'http://localhost:5000/api/event-halls';
const dk = { bg: '#0f1117', card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8' };
const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const statusConfig = {
    HOLD: { bg: 'bg-yellow-900/30', text: 'text-yellow-400 border border-yellow-500/30', label: 'Hold' },
    PENDING: { bg: 'bg-blue-900/30', text: 'text-blue-400 border border-blue-500/30', label: 'Pending' },
    APPROVED: { bg: 'bg-green-900/30', text: 'text-green-400 border border-green-500/30', label: 'Approved' },
    REJECTED: { bg: 'bg-red-900/30', text: 'text-red-400 border border-red-500/30', label: 'Rejected' },
    CANCELLED: { bg: 'bg-red-900/30', text: 'text-red-500 border border-red-500/30', label: 'Cancelled' },
    COMPLETED: { bg: 'bg-purple-900/30', text: 'text-purple-400 border border-purple-500/30', label: 'Completed' },
};

const EventHallManagement = () => {
    const [activeTab, setActiveTab] = useState('halls'); // halls | bookings

    // Halls state
    const [halls, setHalls] = useState([]);
    const [hallModal, setHallModal] = useState(null); // null | 'new' | hall object (edit)
    const [hallForm, setHallForm] = useState({ name: '', description: '', location: '', capacityMin: 10, capacityMax: 200, facilities: '', pricePerHour: 0, pricePerDay: 0, eventTypes: '', images: '' });

    // Bookings state
    const [bookings, setBookings] = useState([]);
    const [totalBookings, setTotalBookings] = useState(0);
    const [bookingPage, setBookingPage] = useState(1);
    const [bookingPages, setBookingPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [hallFilter, setHallFilter] = useState('');
    const [searchText, setSearchText] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);

    const [loading, setLoading] = useState(true);

    // Action modals
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [confirmNote, setConfirmNote] = useState('');

    // Fetch
    const fetchHalls = async () => { 
        try { 
            setLoading(true); 
            const r = await axios.get(`${API}/admin/halls`, { headers: headers() }); 
            setHalls(r.data); 
        } catch { } finally { setLoading(false); } 
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params = { page: bookingPage, limit: 15 };
            if (statusFilter) params.status = statusFilter;
            if (hallFilter) params.hallId = hallFilter;
            if (searchText) params.search = searchText;
            const r = await axios.get(`${API}/admin/bookings`, { headers: headers(), params });
            setBookings(r.data.bookings); setTotalBookings(r.data.total); setBookingPages(r.data.totalPages);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchHalls(); }, []);
    useEffect(() => { if (activeTab === 'bookings') fetchBookings(); }, [activeTab, bookingPage, statusFilter, hallFilter]);

    // Hall CRUD
    const openHallModal = (hall = null) => {
        if (hall) {
            setHallForm({ name: hall.name, description: hall.description || '', location: hall.location || '', capacityMin: hall.capacity?.min || 10, capacityMax: hall.capacity?.max || 200, facilities: (hall.facilities || []).join(', '), pricePerHour: hall.pricePerHour || 0, pricePerDay: hall.pricePerDay || 0, eventTypes: (hall.eventTypes || []).join(', '), images: (hall.images || []).join(', ') });
            setHallModal(hall);
        } else {
            setHallForm({ name: '', description: '', location: '', capacityMin: 10, capacityMax: 200, facilities: '', pricePerHour: 0, pricePerDay: 0, eventTypes: '', images: '' });
            setHallModal('new');
        }
    };

    const saveHall = async () => {
        const data = {
            name: hallForm.name, description: hallForm.description, location: hallForm.location,
            capacity: { min: parseInt(hallForm.capacityMin), max: parseInt(hallForm.capacityMax) },
            facilities: hallForm.facilities.split(',').map(s => s.trim()).filter(Boolean),
            pricePerHour: parseFloat(hallForm.pricePerHour), pricePerDay: parseFloat(hallForm.pricePerDay) || undefined,
            eventTypes: hallForm.eventTypes.split(',').map(s => s.trim()).filter(Boolean),
            images: hallForm.images.split(',').map(s => s.trim()).filter(Boolean)
        };
        try {
            if (hallModal === 'new') { 
                await axios.post(`${API}/admin/halls`, data, { headers: headers() }); 
                Swal.fire({ title: 'Created!', text: 'Hall created successfully.', icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
            } else { 
                await axios.put(`${API}/admin/halls/${hallModal._id}`, data, { headers: headers() }); 
                Swal.fire({ title: 'Updated!', text: 'Hall updated successfully.', icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
            }
            setHallModal(null); fetchHalls();
        } catch (err) { 
            Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to save', icon: 'error', background: dk.card, color: dk.text }); 
        }
    };

    const deleteHall = async (id) => {
        const result = await Swal.fire({
            title: 'Deactivate Hall?',
            text: 'Are you sure you want to deactivate this hall?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Yes, deactivate!',
            background: dk.card,
            color: dk.text
        });

        if (result.isConfirmed) {
            try { 
                await axios.delete(`${API}/admin/halls/${id}`, { headers: headers() }); 
                Swal.fire({ title: 'Deactivated!', text: 'Hall deactivated.', icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
                fetchHalls(); 
            }
            catch { 
                Swal.fire({ title: 'Error!', text: 'Failed to deactivate', icon: 'error', background: dk.card, color: dk.text }); 
            }
        }
    };

    // Booking actions
    const openBookingDetail = async (id) => {
        try { 
            const r = await axios.get(`${API}/admin/bookings/${id}`, { headers: headers() }); 
            setSelectedBooking(r.data); 
        } catch { 
            Swal.fire({ title: 'Error!', text: 'Failed to load booking', icon: 'error', background: dk.card, color: dk.text }); 
        }
    };

    const bookingAction = async (action, body = {}) => {
        try {
            await axios.put(`${API}/admin/bookings/${selectedBooking._id}/${action}`, body, { headers: headers() });
            Swal.fire({ title: 'Success!', text: `Booking ${action}d!`, icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
            setSelectedBooking(null); setShowRejectModal(false); fetchBookings();
        } catch (err) { 
            Swal.fire({ title: 'Error!', text: err.response?.data?.message || `Failed to ${action}`, icon: 'error', background: dk.card, color: dk.text }); 
        }
    };

    const inputClass = "w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none";

    return (
        <div className="animate-fade-in pb-12" style={{ color: dk.text }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <PartyPopper className="w-8 h-8 text-purple-400" />
                    <h1 className="text-3xl font-extrabold text-white">Event Hall Management</h1>
                </div>
                <div className="flex gap-2">
                    {['halls', 'bookings'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold text-sm transition ${activeTab === t ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                            {t === 'halls' ? <Landmark size={16} /> : <List size={16} />}
                            {t === 'halls' ? 'Halls' : 'Bookings'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ========== HALLS TAB ========== */}
            {activeTab === 'halls' && (
                <>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => openHallModal()} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-bold text-sm transition-all hover:-translate-y-0.5 shadow-md" style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}>
                            <Plus size={16} /> Add Hall
                        </button>
                    </div>
                    {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-purple-500" /></div> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {halls.map(h => (
                                <div key={h._id} className={`rounded-xl border shadow-sm p-5 transition ${h.status === 'inactive' ? 'opacity-60' : ''}`} style={{ background: dk.card, borderColor: dk.border }}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-white">{h.name}</h3>
                                        <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${h.status === 'active' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-red-900/30 text-red-500 border-red-500/30'}`}>{h.status}</span>
                                    </div>
                                    {h.location && <p className="text-sm mb-2 flex items-center gap-1" style={{ color: dk.textSec }}><MapPin size={12} /> {h.location}</p>}
                                    <div className="flex gap-3 text-xs mb-3" style={{ color: dk.textSec }}>
                                        <span><Users size={12} className="inline mr-1" />{h.capacity?.min}–{h.capacity?.max}</span>
                                        <span>Rs. {h.pricePerHour?.toLocaleString()}/hr</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openHallModal(h)} className="flex-1 px-3 py-2 text-sm rounded-lg hover:bg-white/10 font-medium transition" style={{ background: dk.elevated }}><Edit size={14} className="inline mr-1" />Edit</button>
                                        <button onClick={() => deleteHall(h._id)} className="px-3 py-2 text-sm text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg hover:bg-red-900/40 font-medium transition"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* ========== BOOKINGS TAB ========== */}
            {activeTab === 'bookings' && (
                <>
                    <div className="flex flex-col md:flex-row gap-3 mb-6">
                        <form onSubmit={(e) => { e.preventDefault(); setBookingPage(1); fetchBookings(); }} className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="Search by name, email, code..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                        </form>
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setBookingPage(1); }} className="px-4 py-3 border rounded-lg text-sm min-w-[140px]" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                            <option value="">All Status</option>
                            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <select value={hallFilter} onChange={(e) => { setHallFilter(e.target.value); setBookingPage(1); }} className="px-4 py-3 border rounded-lg text-sm min-w-[160px]" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                            <option value="">All Halls</option>
                            {halls.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                        </select>
                    </div>

                    {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-purple-500" /></div> : bookings.length === 0 ? (
                        <div className="text-center py-16 rounded-xl border" style={{ background: dk.card, borderColor: dk.border }}>
                            <PartyPopper className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                            <h3 className="text-xl" style={{ color: dk.textSec }}>No bookings</h3>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border shadow-sm" style={{ background: dk.card, borderColor: dk.border }}>
                            <table className="min-w-full divide-y" style={{ divideColor: dk.border }}>
                                <thead style={{ background: dk.elevated }}>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Hall</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Guest</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Event</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Date/Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ divideColor: dk.border }}>
                                    {bookings.map(b => {
                                        const sc = statusConfig[b.status] || statusConfig.PENDING;
                                        return (
                                            <tr key={b._id} className="transition-colors hover:bg-white/5">
                                                <td className="px-4 py-3 text-sm font-mono font-semibold text-purple-400">{b.bookingCode}</td>
                                                <td className="px-4 py-3 text-sm">{b.hallId?.name || '—'}</td>
                                                <td className="px-4 py-3 text-sm">{b.guestDetails?.firstName} {b.guestDetails?.lastName}</td>
                                                <td className="px-4 py-3 text-sm">{b.eventType}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div>{new Date(b.eventDate).toLocaleDateString()}</div>
                                                    <div className="text-xs" style={{ color: dk.textSec }}>{b.startTime} – {b.endTime}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold">Rs. {b.pricing?.totalAmount?.toLocaleString()}</td>
                                                <td className="px-4 py-3"><span className={`px-2.5 py-1 border rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span></td>
                                                <td className="px-4 py-3 text-right"><button onClick={() => openBookingDetail(b._id)} className="p-2 rounded-lg hover:bg-purple-500/20 transition"><Eye size={18} className="text-purple-400" /></button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {bookingPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm" style={{ color: dk.textSec }}>Page {bookingPage} of {bookingPages} ({totalBookings} total)</p>
                            <div className="flex gap-2">
                                <button onClick={() => setBookingPage(p => Math.max(1, p - 1))} disabled={bookingPage === 1} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-white/5 transition" style={{ borderColor: dk.border, background: dk.card }}><ChevronLeft size={16} /> Prev</button>
                                <button onClick={() => setBookingPage(p => Math.min(bookingPages, p + 1))} disabled={bookingPage === bookingPages} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-white/5 transition" style={{ borderColor: dk.border, background: dk.card }}>Next <ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ========== HALL FORM MODAL ========== */}
            {hallModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8" style={{ background: dk.card, border: `1px solid ${dk.border}` }}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{hallModal === 'new' ? 'Add New Hall' : 'Edit Hall'}</h2>
                            <button onClick={() => setHallModal(null)} className="p-2 hover:bg-white/10 rounded-lg transition"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2"><label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Hall Name *</label><input value={hallForm.name} onChange={e => setHallForm({ ...hallForm, name: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} /></div>
                            <div className="col-span-2"><label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Description</label><textarea value={hallForm.description} onChange={e => setHallForm({ ...hallForm, description: e.target.value })} className={`${inputClass} h-20 resize-none`} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} /></div>
                            <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Location</label><input value={hallForm.location} onChange={e => setHallForm({ ...hallForm, location: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Min Capacity</label><input type="number" value={hallForm.capacityMin} onChange={e => setHallForm({ ...hallForm, capacityMin: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} /></div>
                                <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Max Capacity</label><input type="number" value={hallForm.capacityMax} onChange={e => setHallForm({ ...hallForm, capacityMax: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} /></div>
                            </div>
                            <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Price Per Hour (Rs.) *</label><input type="number" value={hallForm.pricePerHour} onChange={e => setHallForm({ ...hallForm, pricePerHour: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} /></div>
                            <div><label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Price Per Day (Rs.)</label><input type="number" value={hallForm.pricePerDay} onChange={e => setHallForm({ ...hallForm, pricePerDay: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} /></div>
                            <div className="col-span-2"><label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Facilities <span className="font-normal opacity-70">(comma separated)</span></label><input value={hallForm.facilities} onChange={e => setHallForm({ ...hallForm, facilities: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="WiFi, Projector, Sound System, AC" /></div>
                            <div className="col-span-2"><label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Event Types <span className="font-normal opacity-70">(comma separated)</span></label><input value={hallForm.eventTypes} onChange={e => setHallForm({ ...hallForm, eventTypes: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="Wedding, Conference, Birthday" /></div>
                            <div className="col-span-2"><label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Image URLs <span className="font-normal opacity-70">(comma separated)</span></label><input value={hallForm.images} onChange={e => setHallForm({ ...hallForm, images: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} /></div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setHallModal(null)} className="px-5 py-3 rounded-lg border text-sm font-semibold transition hover:bg-white/5" style={{ borderColor: dk.border, color: dk.text }}>Cancel</button>
                            <button onClick={saveHall} disabled={!hallForm.name || !hallForm.pricePerHour} className="flex-1 px-5 py-3 rounded-lg text-white text-sm font-bold disabled:opacity-50 transition" style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}>
                                {hallModal === 'new' ? 'Create Hall' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== BOOKING DETAIL MODAL ========== */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: dk.card, border: `1px solid ${dk.border}` }}>
                        <div className="flex items-center justify-between px-8 py-5 border-b sticky top-0 rounded-t-2xl z-10" style={{ background: dk.card, borderColor: dk.border }}>
                            <h2 className="text-xl font-bold text-white">Booking Details</h2>
                            <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-white/10 rounded-lg transition"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="p-8 space-y-5">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1.5 border rounded-full text-sm font-bold ${statusConfig[selectedBooking.status]?.bg} ${statusConfig[selectedBooking.status]?.text}`}>{statusConfig[selectedBooking.status]?.label}</span>
                                <span className="font-mono text-purple-400 font-semibold">{selectedBooking.bookingCode}</span>
                            </div>

                            <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20">
                                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Event Details</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div><span className="text-purple-500/70 text-xs">Hall</span><p className="font-semibold text-purple-200">{selectedBooking.hallId?.name}</p></div>
                                    <div><span className="text-purple-500/70 text-xs">Type</span><p className="font-semibold text-purple-200">{selectedBooking.eventType}</p></div>
                                    <div><span className="text-purple-500/70 text-xs">Date</span><p className="font-semibold text-purple-200">{new Date(selectedBooking.eventDate).toLocaleDateString()}</p></div>
                                    <div><span className="text-purple-500/70 text-xs">Time</span><p className="font-semibold text-purple-200">{selectedBooking.startTime} – {selectedBooking.endTime}</p></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm p-4 rounded-xl border" style={{ background: dk.elevated, borderColor: dk.border }}>
                                <div><span className="text-gray-400 text-xs block mb-1">Guest</span><p className="font-semibold text-white">{selectedBooking.guestDetails?.firstName} {selectedBooking.guestDetails?.lastName}</p></div>
                                <div><span className="text-gray-400 text-xs block mb-1">Email</span><p className="font-semibold text-white">{selectedBooking.guestDetails?.email}</p></div>
                                <div><span className="text-gray-400 text-xs block mb-1">Phone</span><p className="font-semibold text-white">{selectedBooking.guestDetails?.phone}</p></div>
                                <div><span className="text-gray-400 text-xs block mb-1">Guests</span><p className="font-semibold text-white">{selectedBooking.guestCount}</p></div>
                                <div><span className="text-gray-400 text-xs block mb-1">Payment</span><p className="font-semibold text-white">{selectedBooking.paymentStatus}</p></div>
                            </div>

                            <div className="rounded-xl p-5 text-white flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}>
                                <span className="font-bold text-lg">Total Amount</span>
                                <span className="text-3xl font-extrabold">Rs. {selectedBooking.pricing?.totalAmount?.toLocaleString()}</span>
                            </div>

                            {selectedBooking.specialNotes && <div className="bg-amber-900/20 p-4 rounded-xl border border-amber-500/30 text-sm"><span className="font-bold text-amber-500 uppercase tracking-wider text-xs">Notes:</span> <span className="text-amber-200 block mt-1">{selectedBooking.specialNotes}</span></div>}

                            {/* Actions */}
                            <div className="border-t pt-5" style={{ borderColor: dk.border }}>
                                <div className="flex flex-wrap gap-2">
                                    {selectedBooking.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => bookingAction('approve', { confirmationNote: confirmNote })} className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition shadow-sm"><CheckCircle size={16} /> Approve</button>
                                            <button onClick={() => setShowRejectModal(true)} className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition shadow-sm"><XCircle size={16} /> Reject</button>
                                        </>
                                    )}
                                    {['PENDING', 'APPROVED'].includes(selectedBooking.status) && (
                                        <button onClick={() => bookingAction('cancel', { reason: 'Admin cancelled' })} className="flex items-center gap-1.5 px-5 py-2.5 border border-red-500/30 text-red-500 bg-red-900/10 rounded-lg text-sm font-semibold hover:bg-red-900/30 transition shadow-sm"><XCircle size={16} /> Cancel</button>
                                    )}
                                    {selectedBooking.status === 'APPROVED' && (
                                        <button onClick={() => bookingAction('complete')} className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition shadow-sm"><CheckCircle size={16} /> Complete</button>
                                    )}
                                </div>
                                {selectedBooking.status === 'PENDING' && (
                                    <div className="mt-4"><label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Confirmation Note (optional)</label><input value={confirmNote} onChange={e => setConfirmNote(e.target.value)} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="e.g., Hall confirmed with DJ setup" /></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedBooking && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="rounded-2xl shadow-2xl w-full max-w-md p-8" style={{ background: dk.card, border: `1px solid ${dk.border}` }}>
                        <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2"><XCircle size={18} /> Reject Booking</h3>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Reason *</label>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className={`${inputClass} h-24 resize-none`} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="Reason for rejection..." />
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowRejectModal(false)} className="px-5 py-3 rounded-lg border text-sm font-semibold transition hover:bg-white/5" style={{ borderColor: dk.border, color: dk.text }}>Cancel</button>
                            <button onClick={() => bookingAction('reject', { rejectedReason: rejectReason })} disabled={!rejectReason} className="flex-1 px-5 py-3 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition">Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventHallManagement;

