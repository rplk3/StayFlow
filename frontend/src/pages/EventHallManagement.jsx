import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Eye, CheckCircle, XCircle, X, ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin, Trash2, Loader2, PartyPopper, Edit } from 'lucide-react';

const API = 'http://localhost:5000/api/event-halls';
const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const statusConfig = {
    HOLD: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Hold' },
    PENDING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pending' },
    APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
    REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
    CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelled' },
    COMPLETED: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Completed' },
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
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState('');

    // Action modals
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [confirmNote, setConfirmNote] = useState('');

    // Fetch
    const fetchHalls = async () => { try { setLoading(true); const r = await axios.get(`${API}/admin/halls`, { headers: headers() }); setHalls(r.data); } catch { } finally { setLoading(false); } };
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

    const flash = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

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
            if (hallModal === 'new') { await axios.post(`${API}/admin/halls`, data, { headers: headers() }); flash('Hall created!'); }
            else { await axios.put(`${API}/admin/halls/${hallModal._id}`, data, { headers: headers() }); flash('Hall updated!'); }
            setHallModal(null); fetchHalls();
        } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    };

    const deleteHall = async (id) => {
        if (!window.confirm('Deactivate this hall?')) return;
        try { await axios.delete(`${API}/admin/halls/${id}`, { headers: headers() }); flash('Hall deactivated!'); fetchHalls(); }
        catch { setError('Failed to delete'); }
    };

    // Booking actions
    const openBookingDetail = async (id) => {
        try { const r = await axios.get(`${API}/admin/bookings/${id}`, { headers: headers() }); setSelectedBooking(r.data); }
        catch { setError('Failed to load booking'); }
    };

    const bookingAction = async (action, body = {}) => {
        try {
            await axios.put(`${API}/admin/bookings/${selectedBooking._id}/${action}`, body, { headers: headers() });
            flash(`Booking ${action}d!`); setSelectedBooking(null); setShowRejectModal(false); fetchBookings();
        } catch (err) { setError(err.response?.data?.message || `Failed to ${action}`); }
    };

    const inputClass = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none";

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <PartyPopper className="w-8 h-8 text-purple-600" />
                    <h1 className="text-3xl font-extrabold text-[#1E3A8A]">Event Hall Management</h1>
                </div>
                <div className="flex gap-2">
                    {['halls', 'bookings'].map(t => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${activeTab === t ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {t === 'halls' ? '🏛️ Halls' : '📋 Bookings'}
                        </button>
                    ))}
                </div>
            </div>

            {successMsg && <div className="p-3 mb-4 rounded-lg bg-green-50 text-green-800 border-l-4 border-green-500 text-sm font-medium">{successMsg}</div>}
            {error && <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-800 border-l-4 border-red-500 text-sm">{error} <button onClick={() => setError('')} className="ml-2 underline">dismiss</button></div>}

            {/* ========== HALLS TAB ========== */}
            {activeTab === 'halls' && (
                <>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => openHallModal()} className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-semibold text-sm hover:bg-purple-700 transition"><Plus size={16} /> Add Hall</button>
                    </div>
                    {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-purple-500" /></div> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {halls.map(h => (
                                <div key={h._id} className={`bg-white rounded-xl border shadow-sm p-5 transition ${h.status === 'inactive' ? 'opacity-60' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900">{h.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${h.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{h.status}</span>
                                    </div>
                                    {h.location && <p className="text-sm text-gray-500 mb-2 flex items-center gap-1"><MapPin size={12} /> {h.location}</p>}
                                    <div className="flex gap-3 text-xs text-gray-500 mb-3">
                                        <span><Users size={12} className="inline mr-1" />{h.capacity?.min}–{h.capacity?.max}</span>
                                        <span>Rs. {h.pricePerHour?.toLocaleString()}/hr</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openHallModal(h)} className="flex-1 px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"><Edit size={14} className="inline mr-1" />Edit</button>
                                        <button onClick={() => deleteHall(h._id)} className="px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 font-medium"><Trash2 size={14} /></button>
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
                            <input type="text" placeholder="Search by name, email, code..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                        </form>
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setBookingPage(1); }} className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[140px]">
                            <option value="">All Status</option>
                            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                        <select value={hallFilter} onChange={(e) => { setHallFilter(e.target.value); setBookingPage(1); }} className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[160px]">
                            <option value="">All Halls</option>
                            {halls.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                        </select>
                    </div>

                    {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-purple-500" /></div> : bookings.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-xl"><PartyPopper className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl text-gray-500">No bookings</h3></div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">Code</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">Hall</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">Guest</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">Event</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">Date/Time</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">Amount</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold uppercase text-gray-500">Status</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold uppercase text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {bookings.map(b => {
                                        const sc = statusConfig[b.status] || statusConfig.PENDING;
                                        return (
                                            <tr key={b._id} className="hover:bg-purple-50 transition-colors">
                                                <td className="px-4 py-3 text-sm font-mono font-semibold text-purple-700">{b.bookingCode}</td>
                                                <td className="px-4 py-3 text-sm">{b.hallId?.name || '—'}</td>
                                                <td className="px-4 py-3 text-sm">{b.guestDetails?.firstName} {b.guestDetails?.lastName}</td>
                                                <td className="px-4 py-3 text-sm">{b.eventType}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div>{new Date(b.eventDate).toLocaleDateString()}</div>
                                                    <div className="text-xs text-gray-400">{b.startTime} – {b.endTime}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold">Rs. {b.pricing?.totalAmount?.toLocaleString()}</td>
                                                <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>{sc.label}</span></td>
                                                <td className="px-4 py-3 text-right"><button onClick={() => openBookingDetail(b._id)} className="p-2 rounded-lg hover:bg-purple-100 transition"><Eye size={18} className="text-purple-600" /></button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {bookingPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-500">Page {bookingPage} of {bookingPages} ({totalBookings} total)</p>
                            <div className="flex gap-2">
                                <button onClick={() => setBookingPage(p => Math.max(1, p - 1))} disabled={bookingPage === 1} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50"><ChevronLeft size={16} /> Prev</button>
                                <button onClick={() => setBookingPage(p => Math.min(bookingPages, p + 1))} disabled={bookingPage === bookingPages} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50">Next <ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ========== HALL FORM MODAL ========== */}
            {hallModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-[#1E3A8A]">{hallModal === 'new' ? 'Add New Hall' : 'Edit Hall'}</h2>
                            <button onClick={() => setHallModal(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2"><label className="block text-sm font-semibold mb-1">Hall Name *</label><input value={hallForm.name} onChange={e => setHallForm({ ...hallForm, name: e.target.value })} className={inputClass} /></div>
                            <div className="col-span-2"><label className="block text-sm font-semibold mb-1">Description</label><textarea value={hallForm.description} onChange={e => setHallForm({ ...hallForm, description: e.target.value })} className={`${inputClass} h-20 resize-none`} /></div>
                            <div><label className="block text-sm font-semibold mb-1">Location</label><input value={hallForm.location} onChange={e => setHallForm({ ...hallForm, location: e.target.value })} className={inputClass} /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="block text-sm font-semibold mb-1">Min Capacity</label><input type="number" value={hallForm.capacityMin} onChange={e => setHallForm({ ...hallForm, capacityMin: e.target.value })} className={inputClass} /></div>
                                <div><label className="block text-sm font-semibold mb-1">Max Capacity</label><input type="number" value={hallForm.capacityMax} onChange={e => setHallForm({ ...hallForm, capacityMax: e.target.value })} className={inputClass} /></div>
                            </div>
                            <div><label className="block text-sm font-semibold mb-1">Price Per Hour (Rs.) *</label><input type="number" value={hallForm.pricePerHour} onChange={e => setHallForm({ ...hallForm, pricePerHour: e.target.value })} className={inputClass} /></div>
                            <div><label className="block text-sm font-semibold mb-1">Price Per Day (Rs.)</label><input type="number" value={hallForm.pricePerDay} onChange={e => setHallForm({ ...hallForm, pricePerDay: e.target.value })} className={inputClass} /></div>
                            <div className="col-span-2"><label className="block text-sm font-semibold mb-1">Facilities <span className="font-normal text-gray-400">(comma separated)</span></label><input value={hallForm.facilities} onChange={e => setHallForm({ ...hallForm, facilities: e.target.value })} className={inputClass} placeholder="WiFi, Projector, Sound System, AC" /></div>
                            <div className="col-span-2"><label className="block text-sm font-semibold mb-1">Event Types <span className="font-normal text-gray-400">(comma separated)</span></label><input value={hallForm.eventTypes} onChange={e => setHallForm({ ...hallForm, eventTypes: e.target.value })} className={inputClass} placeholder="Wedding, Conference, Birthday" /></div>
                            <div className="col-span-2"><label className="block text-sm font-semibold mb-1">Image URLs <span className="font-normal text-gray-400">(comma separated)</span></label><input value={hallForm.images} onChange={e => setHallForm({ ...hallForm, images: e.target.value })} className={inputClass} /></div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setHallModal(null)} className="px-5 py-3 rounded-lg border text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={saveHall} disabled={!hallForm.name || !hallForm.pricePerHour} className="flex-1 px-5 py-3 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-50 transition">
                                {hallModal === 'new' ? 'Create Hall' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== BOOKING DETAIL MODAL ========== */}
            {selectedBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                            <h2 className="text-xl font-bold text-[#1E3A8A]">Booking Details</h2>
                            <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="p-8 space-y-5">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${statusConfig[selectedBooking.status]?.bg} ${statusConfig[selectedBooking.status]?.text}`}>{statusConfig[selectedBooking.status]?.label}</span>
                                <span className="font-mono text-purple-700 font-semibold">{selectedBooking.bookingCode}</span>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <h4 className="text-xs font-bold text-purple-700 uppercase mb-2">Event Details</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                    <div><span className="text-purple-400 text-xs">Hall</span><p className="font-semibold">{selectedBooking.hallId?.name}</p></div>
                                    <div><span className="text-purple-400 text-xs">Type</span><p className="font-semibold">{selectedBooking.eventType}</p></div>
                                    <div><span className="text-purple-400 text-xs">Date</span><p className="font-semibold">{new Date(selectedBooking.eventDate).toLocaleDateString()}</p></div>
                                    <div><span className="text-purple-400 text-xs">Time</span><p className="font-semibold">{selectedBooking.startTime} – {selectedBooking.endTime}</p></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div><span className="text-gray-400 text-xs">Guest</span><p className="font-semibold">{selectedBooking.guestDetails?.firstName} {selectedBooking.guestDetails?.lastName}</p></div>
                                <div><span className="text-gray-400 text-xs">Email</span><p className="font-semibold">{selectedBooking.guestDetails?.email}</p></div>
                                <div><span className="text-gray-400 text-xs">Phone</span><p className="font-semibold">{selectedBooking.guestDetails?.phone}</p></div>
                                <div><span className="text-gray-400 text-xs">Guests</span><p className="font-semibold">{selectedBooking.guestCount}</p></div>
                                <div><span className="text-gray-400 text-xs">Payment</span><p className="font-semibold">{selectedBooking.paymentStatus}</p></div>
                            </div>

                            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl p-5 text-white flex items-center justify-between">
                                <span className="font-bold text-lg">Total Amount</span>
                                <span className="text-3xl font-extrabold">Rs. {selectedBooking.pricing?.totalAmount?.toLocaleString()}</span>
                            </div>

                            {selectedBooking.specialNotes && <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-sm"><span className="font-bold text-amber-800">Notes:</span> {selectedBooking.specialNotes}</div>}

                            {/* Actions */}
                            <div className="border-t pt-5">
                                <div className="flex flex-wrap gap-2">
                                    {selectedBooking.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => bookingAction('approve', { confirmationNote: confirmNote })} className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"><CheckCircle size={16} /> Approve</button>
                                            <button onClick={() => setShowRejectModal(true)} className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"><XCircle size={16} /> Reject</button>
                                        </>
                                    )}
                                    {['PENDING', 'APPROVED'].includes(selectedBooking.status) && (
                                        <button onClick={() => bookingAction('cancel', { reason: 'Admin cancelled' })} className="flex items-center gap-1.5 px-5 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50"><XCircle size={16} /> Cancel</button>
                                    )}
                                    {selectedBooking.status === 'APPROVED' && (
                                        <button onClick={() => bookingAction('complete')} className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"><CheckCircle size={16} /> Complete</button>
                                    )}
                                </div>
                                {selectedBooking.status === 'PENDING' && (
                                    <div className="mt-3"><label className="block text-xs font-semibold text-gray-500 mb-1">Confirmation Note (optional)</label><input value={confirmNote} onChange={e => setConfirmNote(e.target.value)} className={inputClass} placeholder="e.g., Hall confirmed with DJ setup" /></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedBooking && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                        <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2"><XCircle size={18} /> Reject Booking</h3>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Reason *</label>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className={`${inputClass} h-24 resize-none`} placeholder="Reason for rejection..." />
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowRejectModal(false)} className="px-5 py-3 rounded-lg border text-sm font-semibold hover:bg-gray-50">Cancel</button>
                            <button onClick={() => bookingAction('reject', { rejectedReason: rejectReason })} disabled={!rejectReason} className="flex-1 px-5 py-3 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50">Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventHallManagement;
