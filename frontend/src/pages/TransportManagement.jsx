import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Search, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, X, Send, Trash2, MapPin, Calendar, Clock, Users, Navigation, Building2, AlertTriangle, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const API = 'http://localhost:5000/api/transport';
const dk = { bg: '#0f1117', card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8' };
const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const statusConfig = {
    pending: { bg: 'bg-yellow-900/30', text: 'text-yellow-400 border border-yellow-500/30', dot: 'bg-yellow-400', label: 'Pending' },
    confirmed: { bg: 'bg-green-900/30', text: 'text-green-400 border border-green-500/30', dot: 'bg-green-400', label: 'Confirmed' },
    rejected: { bg: 'bg-red-900/30', text: 'text-red-400 border border-red-500/30', dot: 'bg-red-400', label: 'Rejected' },
    'in-transit': { bg: 'bg-blue-900/30', text: 'text-blue-400 border border-blue-500/30', dot: 'bg-blue-400', label: 'In Transit' },
    completed: { bg: 'bg-gray-800/50', text: 'text-gray-400 border border-gray-600', dot: 'bg-gray-400', label: 'Completed' },
    cancelled: { bg: 'bg-red-900/30', text: 'text-red-500 border border-red-500/30', dot: 'bg-red-500', label: 'Cancelled' },
};

const vehicleLabel = { sedan: 'Sedan', suv: 'SUV', van: 'Van', luxury: 'Luxury' };

const TransportManagement = () => {
    const [transports, setTransports] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // Detail/Action modal
    const [selected, setSelected] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Forward modal
    const [showForward, setShowForward] = useState(false);
    const [forwardData, setForwardData] = useState({ companyName: '', reference: '', notes: '' });

    // Reject modal
    const [showReject, setShowReject] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const fetchTransports = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 15 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (vehicleFilter) params.vehicleType = vehicleFilter;
            const res = await axios.get(API, { headers: headers(), params });
            setTransports(res.data.transports);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            Swal.fire({ title: 'Error!', text: 'Failed to fetch transport requests', icon: 'error', background: dk.card, color: dk.text });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTransports(); }, [page, statusFilter, vehicleFilter]);

    const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchTransports(); };

    const openDetail = async (id) => {
        try {
            setDetailLoading(true);
            const res = await axios.get(`${API}/${id}`, { headers: headers() });
            setSelected(res.data);
        } catch { 
            Swal.fire({ title: 'Error!', text: 'Failed to load details', icon: 'error', background: dk.card, color: dk.text });
        } finally { setDetailLoading(false); }
    };

    const doAction = async (action, body = {}) => {
        try {
            await axios.put(`${API}/${selected._id}/${action}`, body, { headers: headers() });
            Swal.fire({ title: 'Success!', text: `Transport ${action}d successfully!`, icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
            setSelected(null);
            setShowForward(false);
            setShowReject(false);
            fetchTransports();
        } catch (err) {
            Swal.fire({ title: 'Error!', text: err.response?.data?.message || `Failed to ${action}`, icon: 'error', background: dk.card, color: dk.text });
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Delete Request?',
            text: 'Are you sure you want to delete this transport request?',
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
                await axios.delete(`${API}/${id}`, { headers: headers() });
                Swal.fire({ title: 'Deleted!', text: 'Transport deleted!', icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
                setSelected(null);
                fetchTransports();
            } catch {
                Swal.fire({ title: 'Error!', text: 'Failed to delete transport', icon: 'error', background: dk.card, color: dk.text });
            }
        }
    };

    return (
        <div className="animate-fade-in pb-12" style={{ color: dk.text }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Car className="w-8 h-8 text-indigo-400" />
                        <h1 className="text-3xl font-extrabold">Transport Management</h1>
                    </div>
                    <p className="mt-1" style={{ color: dk.textSec }}><span className="font-semibold text-white">{total}</span> transport requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input type="text" placeholder="Search by address, company..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                </form>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-3 border rounded-lg text-sm min-w-[150px] outline-none" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                    <option value="">All Status</option>
                    {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={vehicleFilter} onChange={(e) => { setVehicleFilter(e.target.value); setPage(1); }} className="px-4 py-3 border rounded-lg text-sm min-w-[140px] outline-none" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                    <option value="">All Vehicles</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="van">Van</option>
                    <option value="luxury">Luxury</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-indigo-500" /><span className="ml-3" style={{ color: dk.textSec }}>Loading...</span></div>
            ) : transports.length === 0 ? (
                <div className="text-center py-16 rounded-xl border" style={{ background: dk.card, borderColor: dk.border }}>
                    <Car className="w-16 h-16 text-indigo-500/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">No Transport Requests</h3>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border shadow-sm" style={{ background: dk.card, borderColor: dk.border }}>
                    <table className="min-w-full divide-y" style={{ divideColor: dk.border }}>
                        <thead style={{ background: dk.elevated }}>
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase" style={{ color: dk.textSec }}>Pickup</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase" style={{ color: dk.textSec }}>Drop-off</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase" style={{ color: dk.textSec }}>Date/Time</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase" style={{ color: dk.textSec }}>Vehicle</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase" style={{ color: dk.textSec }}>Cost</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase" style={{ color: dk.textSec }}>Status</th>
                                <th className="px-4 py-4 text-left text-xs font-bold uppercase" style={{ color: dk.textSec }}>Company</th>
                                <th className="px-4 py-4 text-right text-xs font-bold uppercase" style={{ color: dk.textSec }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ divideColor: dk.border }}>
                            {transports.map(t => {
                                const sc = statusConfig[t.status] || statusConfig.pending;
                                return (
                                    <tr key={t._id} className="transition-colors hover:bg-white/5">
                                        <td className="px-4 py-3 text-sm max-w-[180px] truncate" title={t.pickupAddress}>{t.pickupAddress}</td>
                                        <td className="px-4 py-3 text-sm max-w-[180px] truncate" title={t.dropoffAddress}>{t.dropoffAddress}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="text-white">{new Date(t.pickupDate).toLocaleDateString()}</div>
                                            <div className="text-xs" style={{ color: dk.textSec }}>{t.pickupTime}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm capitalize">{vehicleLabel[t.vehicleType] || t.vehicleType}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-white">Rs. {t.estimatedCost?.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${sc.dot}`}></span>{sc.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: dk.textSec }}>{t.forwardedToCompany?.companyName || <span className="opacity-50">—</span>}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => openDetail(t._id)} className="p-2 rounded-lg hover:bg-indigo-500/20 transition" title="View Details">
                                                <Eye size={18} className="text-indigo-400" />
                                            </button>
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
                    <p className="text-sm" style={{ color: dk.textSec }}>Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-white/5 transition" style={{ borderColor: dk.border, background: dk.card }}><ChevronLeft size={16} /> Prev</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-white/5 transition" style={{ borderColor: dk.border, background: dk.card }}>Next <ChevronRight size={16} /></button>
                    </div>
                </div>
            )}

            {/* Detail/Action Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ background: dk.card, border: `1px solid ${dk.border}` }}>
                        <div className="flex items-center justify-between px-8 py-5 border-b sticky top-0 rounded-t-2xl z-10" style={{ background: dk.card, borderColor: dk.border }}>
                            <h2 className="text-xl font-bold text-white">Transport Request Details</h2>
                            <button onClick={() => setSelected(null)} className="p-2 hover:bg-white/10 rounded-lg transition" style={{ color: dk.textSec }}><X size={20} /></button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${statusConfig[selected.status]?.bg} ${statusConfig[selected.status]?.text}`}>
                                        <span className={`w-2 h-2 rounded-full mr-2 ${statusConfig[selected.status]?.dot}`}></span>
                                        {statusConfig[selected.status]?.label}
                                    </span>
                                    <span className="text-xs" style={{ color: dk.textSec }}>Created {new Date(selected.createdAt).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Linked Booking */}
                            {selected.bookingId && (
                                <div className="bg-indigo-900/10 rounded-xl p-5 border border-indigo-500/20">
                                    <h3 className="text-sm font-bold text-indigo-400 mb-3 flex items-center gap-2"><Building2 size={16} /> Linked Booking</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div><p className="text-indigo-500/70 text-xs">Hotel</p><p className="font-semibold text-indigo-300">{selected.bookingId.hotelId?.name || 'N/A'}</p></div>
                                        <div><p className="text-indigo-500/70 text-xs">Code</p><p className="font-mono font-semibold text-indigo-300">{selected.bookingId.bookingCode || 'N/A'}</p></div>
                                        <div><p className="text-indigo-500/70 text-xs">Guest</p><p className="font-semibold text-indigo-300">{selected.bookingId.guestDetails?.firstName} {selected.bookingId.guestDetails?.lastName}</p></div>
                                        <div><p className="text-indigo-500/70 text-xs">Booking Status</p>
                                            <p className={`font-bold text-xs ${selected.bookingId.status === 'CONFIRMED' ? 'text-green-400' : selected.bookingId.status === 'CANCELLED' ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {selected.bookingId.status}
                                            </p>
                                        </div>
                                    </div>
                                    {selected.bookingId.status === 'CANCELLED' && (
                                        <div className="mt-3 p-2 bg-red-900/20 rounded-lg text-red-400 text-xs flex items-center gap-1 border border-red-500/20"><AlertTriangle size={12} /> Booking is CANCELLED — consider rejecting this transport</div>
                                    )}
                                </div>
                            )}

                            {/* Pickup & Dropoff */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-green-900/10 rounded-xl p-4 border border-green-500/20">
                                    <h4 className="text-xs font-bold text-green-500 uppercase mb-2 flex items-center gap-1"><Navigation size={12} /> Pickup</h4>
                                    <p className="text-sm font-semibold text-green-100">{selected.pickupAddress}</p>
                                    {selected.pickupCoords && <p className="text-xs text-green-600/70 mt-1 flex items-center gap-1"><MapPin size={10} /> {selected.pickupCoords.lat?.toFixed(4)}, {selected.pickupCoords.lng?.toFixed(4)}</p>}
                                </div>
                                <div className="bg-red-900/10 rounded-xl p-4 border border-red-500/20">
                                    <h4 className="text-xs font-bold text-red-500 uppercase mb-2 flex items-center gap-1"><MapPin size={12} /> Drop-off</h4>
                                    <p className="text-sm font-semibold text-red-100">{selected.dropoffAddress}</p>
                                    {selected.dropoffCoords && <p className="text-xs text-red-600/70 mt-1 flex items-center gap-1"><MapPin size={10} /> {selected.dropoffCoords.lat?.toFixed(4)}, {selected.dropoffCoords.lng?.toFixed(4)}</p>}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm" style={{ background: dk.elevated, padding: '1.25rem', borderRadius: '0.75rem', border: `1px solid ${dk.border}` }}>
                                <div><p className="text-xs mb-1 uppercase tracking-wider font-bold" style={{ color: dk.textSec }}>Date</p><p className="font-semibold text-white">{new Date(selected.pickupDate).toLocaleDateString()}</p></div>
                                <div><p className="text-xs mb-1 uppercase tracking-wider font-bold" style={{ color: dk.textSec }}>Time</p><p className="font-semibold text-white">{selected.pickupTime}</p></div>
                                <div><p className="text-xs mb-1 uppercase tracking-wider font-bold" style={{ color: dk.textSec }}>Vehicle</p><p className="font-semibold text-white capitalize">{vehicleLabel[selected.vehicleType]}</p></div>
                                <div><p className="text-xs mb-1 uppercase tracking-wider font-bold" style={{ color: dk.textSec }}>Passengers</p><p className="font-semibold text-white">{selected.passengerCount}</p></div>
                                <div><p className="text-xs mb-1 uppercase tracking-wider font-bold" style={{ color: dk.textSec }}>Distance</p><p className="font-semibold text-white">{selected.estimatedDistance} km</p></div>
                            </div>

                            {/* Cost */}
                            <div className="rounded-xl p-5 text-white flex items-center justify-between shadow-md" style={{ background: 'linear-gradient(135deg, #4f46e5, #3b82f6)' }}>
                                <span className="font-bold text-lg">Estimated Cost</span>
                                <span className="text-3xl font-extrabold">Rs. {selected.estimatedCost?.toLocaleString()}</span>
                            </div>

                            {/* Special Requests */}
                            {selected.specialRequests && (
                                <div className="bg-amber-900/20 rounded-xl p-4 border border-amber-500/30 text-sm">
                                    <p className="font-bold text-amber-500 text-xs mb-1 uppercase tracking-wider">Special Requests</p>
                                    <p className="text-amber-200">{selected.specialRequests}</p>
                                </div>
                            )}

                            {/* Forwarded Company */}
                            {selected.forwardedToCompany?.companyName && (
                                <div className="bg-purple-900/10 rounded-xl p-4 border border-purple-500/20">
                                    <p className="font-bold text-purple-400 text-xs mb-3 uppercase tracking-wider flex items-center gap-2"><Send size={14} /> Forwarded to Transport Company</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                        <div><span className="text-purple-500/70 text-xs block mb-0.5">Company:</span> <span className="font-semibold text-purple-200">{selected.forwardedToCompany.companyName}</span></div>
                                        <div><span className="text-purple-500/70 text-xs block mb-0.5">Reference:</span> <span className="font-semibold text-purple-200">{selected.forwardedToCompany.reference || '—'}</span></div>
                                        <div><span className="text-purple-500/70 text-xs block mb-0.5">Forwarded:</span> <span className="font-semibold text-purple-200">{selected.forwardedToCompany.forwardedAt ? new Date(selected.forwardedToCompany.forwardedAt).toLocaleString() : '—'}</span></div>
                                    </div>
                                    {selected.forwardedToCompany.notes && <p className="text-purple-300 text-xs mt-3 p-3 bg-purple-900/20 rounded-lg">{selected.forwardedToCompany.notes}</p>}
                                </div>
                            )}

                            <div className="border-t pt-5" style={{ borderColor: dk.border }}>
                                <div className="flex flex-wrap gap-2">
                                    {selected.status === 'pending' && (
                                        <>
                                            <button onClick={() => doAction('approve', { approvedBy: 'Admin' })} className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition shadow-sm">
                                                <CheckCircle size={16} /> Approve
                                            </button>
                                            <button onClick={() => setShowReject(true)} className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition shadow-sm">
                                                <XCircle size={16} /> Reject
                                            </button>
                                        </>
                                    )}
                                    {['pending', 'confirmed'].includes(selected.status) && (
                                        <button onClick={() => doAction('cancel')} className="flex items-center gap-1.5 px-5 py-2.5 border border-red-500/50 text-red-500 rounded-lg text-sm font-semibold hover:bg-red-500/10 transition">
                                            <XCircle size={16} /> Cancel
                                        </button>
                                    )}
                                    {selected.status === 'confirmed' && (
                                        <button onClick={() => doAction('complete')} className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
                                            <CheckCircle size={16} /> Mark Complete
                                        </button>
                                    )}
                                    {['pending', 'confirmed'].includes(selected.status) && (
                                        <button onClick={() => setShowForward(true)} className="flex items-center gap-1.5 px-5 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition shadow-sm">
                                            <Send size={16} /> Forward to Company
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(selected._id)} className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-600 text-gray-400 rounded-lg text-sm font-semibold hover:bg-gray-800 transition ml-auto">
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Forward Modal */}
            {showForward && selected && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="rounded-2xl shadow-2xl w-full max-w-md p-8" style={{ background: dk.card, border: `1px solid ${dk.border}` }}>
                        <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2"><Send size={18} /> Forward to Transport Company</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">Company Name *</label>
                                <input type="text" value={forwardData.companyName} onChange={e => setForwardData({ ...forwardData, companyName: e.target.value })} className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="e.g. Cabs (Pvt) Ltd" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">Reference / Confirmation #</label>
                                <input type="text" value={forwardData.reference} onChange={e => setForwardData({ ...forwardData, reference: e.target.value })} className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="e.g. C-2026-0042" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">Notes</label>
                                <textarea value={forwardData.notes} onChange={e => setForwardData({ ...forwardData, notes: e.target.value })} className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none h-20 resize-none" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="Additional notes..." />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowForward(false)} className="px-5 py-3 rounded-lg border text-sm font-semibold transition hover:bg-white/5" style={{ borderColor: dk.border, color: dk.text }}>Cancel</button>
                            <button onClick={() => doAction('forward', forwardData)} disabled={!forwardData.companyName} className="flex-1 px-5 py-3 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-50 transition">
                                Send to Company
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showReject && selected && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="rounded-2xl shadow-2xl w-full max-w-md p-8" style={{ background: dk.card, border: `1px solid ${dk.border}` }}>
                        <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2"><XCircle size={18} /> Reject Transport Request</h3>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">Rejection Reason *</label>
                            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full px-4 py-3 border rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none" style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="Reason for rejection..." />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowReject(false)} className="px-5 py-3 rounded-lg border text-sm font-semibold transition hover:bg-white/5" style={{ borderColor: dk.border, color: dk.text }}>Cancel</button>
                            <button onClick={() => doAction('reject', { rejectionReason: rejectReason })} disabled={!rejectReason} className="flex-1 px-5 py-3 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition">
                                Reject Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportManagement;
