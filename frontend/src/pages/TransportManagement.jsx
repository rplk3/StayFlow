import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Search, ChevronLeft, ChevronRight, Eye, CheckCircle, XCircle, X, Send, Trash2, MapPin, Calendar, Clock, Users, Navigation, Building2, AlertTriangle, Loader2 } from 'lucide-react';

const API = 'http://localhost:5000/api/transport';
const token = () => localStorage.getItem('token');
const headers = () => ({ Authorization: `Bearer ${token()}` });

const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', label: 'Pending' },
    confirmed: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', label: 'Confirmed' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Rejected' },
    'in-transit': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'In Transit' },
    completed: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-500', label: 'Completed' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-400', label: 'Cancelled' },
};

const vehicleLabel = { sedan: '🚗 Sedan', suv: '🚙 SUV', van: '🚐 Van', luxury: '👑 Luxury' };

const TransportManagement = () => {
    const [transports, setTransports] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [vehicleFilter, setVehicleFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [error, setError] = useState('');

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
            setError('Failed to fetch transport requests');
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
        } catch { setError('Failed to load details'); }
        finally { setDetailLoading(false); }
    };

    const doAction = async (action, body = {}) => {
        try {
            await axios.put(`${API}/${selected._id}/${action}`, body, { headers: headers() });
            setSuccessMsg(`Transport ${action}d successfully!`);
            setSelected(null);
            setShowForward(false);
            setShowReject(false);
            fetchTransports();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${action}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transport request?')) return;
        try {
            await axios.delete(`${API}/${id}`, { headers: headers() });
            setSuccessMsg('Transport deleted!');
            setSelected(null);
            fetchTransports();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch { setError('Failed to delete'); }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Car className="w-8 h-8 text-[#0071C2]" />
                        <h1 className="text-3xl font-extrabold text-[#1E3A8A]">Transport Management</h1>
                    </div>
                    <p className="text-gray-500 mt-1"><span className="font-semibold text-gray-700">{total}</span> transport requests</p>
                </div>
            </div>

            {successMsg && <div className="p-4 mb-4 rounded-lg bg-green-50 text-green-800 border-l-4 border-green-500 text-sm font-medium">{successMsg}</div>}
            {error && <div className="p-4 mb-4 rounded-lg bg-red-50 text-red-800 border-l-4 border-red-500 text-sm font-medium">{error} <button onClick={() => setError('')} className="ml-2 underline">dismiss</button></div>}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Search by address, company..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071C2] focus:border-transparent outline-none text-sm" />
                </form>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[150px]">
                    <option value="">All Status</option>
                    {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select value={vehicleFilter} onChange={(e) => { setVehicleFilter(e.target.value); setPage(1); }} className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[140px]">
                    <option value="">All Vehicles</option>
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="van">Van</option>
                    <option value="luxury">Luxury</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin w-8 h-8 text-[#0071C2]" /><span className="ml-3 text-gray-500">Loading...</span></div>
            ) : transports.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                    <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600">No Transport Requests</h3>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase">Pickup</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase">Drop-off</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date/Time</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase">Vehicle</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase">Cost</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase">Company</th>
                                <th className="px-4 py-4 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {transports.map(t => {
                                const sc = statusConfig[t.status] || statusConfig.pending;
                                return (
                                    <tr key={t._id} className="hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-700 max-w-[180px] truncate" title={t.pickupAddress}>{t.pickupAddress}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 max-w-[180px] truncate" title={t.dropoffAddress}>{t.dropoffAddress}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            <div>{new Date(t.pickupDate).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-400">{t.pickupTime}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm capitalize">{vehicleLabel[t.vehicleType] || t.vehicleType}</td>
                                        <td className="px-4 py-3 text-sm font-semibold">Rs. {t.estimatedCost?.toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${sc.dot}`}></span>{sc.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{t.forwardedToCompany?.companyName || <span className="text-gray-300">—</span>}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => openDetail(t._id)} className="p-2 rounded-lg hover:bg-blue-100 transition" title="View Details">
                                                <Eye size={18} className="text-blue-600" />
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
                    <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50"><ChevronLeft size={16} /> Prev</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50">Next <ChevronRight size={16} /></button>
                    </div>
                </div>
            )}

            {/* Detail/Action Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                            <h2 className="text-xl font-bold text-[#1E3A8A]">Transport Request Details</h2>
                            <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-500" /></button>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold ${statusConfig[selected.status]?.bg} ${statusConfig[selected.status]?.text}`}>
                                        <span className={`w-2 h-2 rounded-full mr-2 ${statusConfig[selected.status]?.dot}`}></span>
                                        {statusConfig[selected.status]?.label}
                                    </span>
                                    <span className="text-xs text-gray-400">Created {new Date(selected.createdAt).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Linked Booking */}
                            {selected.bookingId && (
                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                    <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2"><Building2 size={16} /> Linked Booking</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div><p className="text-blue-400 text-xs">Hotel</p><p className="font-semibold text-blue-900">{selected.bookingId.hotelId?.name || 'N/A'}</p></div>
                                        <div><p className="text-blue-400 text-xs">Code</p><p className="font-mono font-semibold text-blue-900">{selected.bookingId.bookingCode || 'N/A'}</p></div>
                                        <div><p className="text-blue-400 text-xs">Guest</p><p className="font-semibold text-blue-900">{selected.bookingId.guestDetails?.firstName} {selected.bookingId.guestDetails?.lastName}</p></div>
                                        <div><p className="text-blue-400 text-xs">Booking Status</p>
                                            <p className={`font-bold text-xs ${selected.bookingId.status === 'CONFIRMED' ? 'text-green-600' : selected.bookingId.status === 'CANCELLED' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                {selected.bookingId.status}
                                            </p>
                                        </div>
                                    </div>
                                    {selected.bookingId.status === 'CANCELLED' && (
                                        <div className="mt-3 p-2 bg-red-50 rounded-lg text-red-700 text-xs flex items-center gap-1"><AlertTriangle size={12} /> Booking is CANCELLED — consider rejecting this transport</div>
                                    )}
                                </div>
                            )}

                            {/* Pickup & Dropoff */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                    <h4 className="text-xs font-bold text-green-800 uppercase mb-2 flex items-center gap-1"><Navigation size={12} /> Pickup</h4>
                                    <p className="text-sm font-semibold text-gray-800">{selected.pickupAddress}</p>
                                    {selected.pickupCoords && <p className="text-xs text-gray-400 mt-1">📍 {selected.pickupCoords.lat?.toFixed(4)}, {selected.pickupCoords.lng?.toFixed(4)}</p>}
                                </div>
                                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                                    <h4 className="text-xs font-bold text-red-800 uppercase mb-2 flex items-center gap-1"><MapPin size={12} /> Drop-off</h4>
                                    <p className="text-sm font-semibold text-gray-800">{selected.dropoffAddress}</p>
                                    {selected.dropoffCoords && <p className="text-xs text-gray-400 mt-1">📍 {selected.dropoffCoords.lat?.toFixed(4)}, {selected.dropoffCoords.lng?.toFixed(4)}</p>}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                <div><p className="text-gray-400 text-xs mb-1">Date</p><p className="font-semibold">{new Date(selected.pickupDate).toLocaleDateString()}</p></div>
                                <div><p className="text-gray-400 text-xs mb-1">Time</p><p className="font-semibold">{selected.pickupTime}</p></div>
                                <div><p className="text-gray-400 text-xs mb-1">Vehicle</p><p className="font-semibold capitalize">{vehicleLabel[selected.vehicleType]}</p></div>
                                <div><p className="text-gray-400 text-xs mb-1">Passengers</p><p className="font-semibold">{selected.passengerCount}</p></div>
                                <div><p className="text-gray-400 text-xs mb-1">Distance</p><p className="font-semibold">{selected.estimatedDistance} km</p></div>
                            </div>

                            {/* Cost */}
                            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-xl p-5 text-white flex items-center justify-between">
                                <span className="font-bold text-lg">Estimated Cost</span>
                                <span className="text-3xl font-extrabold">Rs. {selected.estimatedCost?.toLocaleString()}</span>
                            </div>

                            {/* Special Requests */}
                            {selected.specialRequests && (
                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-sm">
                                    <p className="font-bold text-amber-800 text-xs mb-1">Special Requests</p>
                                    <p className="text-amber-900">{selected.specialRequests}</p>
                                </div>
                            )}

                            {/* Forwarded Company */}
                            {selected.forwardedToCompany?.companyName && (
                                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                                    <p className="font-bold text-purple-800 text-xs mb-2">📋 Forwarded to Transport Company</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                        <div><span className="text-purple-500">Company:</span> <span className="font-semibold">{selected.forwardedToCompany.companyName}</span></div>
                                        <div><span className="text-purple-500">Reference:</span> <span className="font-semibold">{selected.forwardedToCompany.reference || '—'}</span></div>
                                        <div><span className="text-purple-500">Forwarded:</span> <span className="font-semibold">{selected.forwardedToCompany.forwardedAt ? new Date(selected.forwardedToCompany.forwardedAt).toLocaleString() : '—'}</span></div>
                                    </div>
                                    {selected.forwardedToCompany.notes && <p className="text-purple-700 text-xs mt-2">{selected.forwardedToCompany.notes}</p>}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="border-t border-gray-100 pt-5">
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
                                        <button onClick={() => doAction('cancel')} className="flex items-center gap-1.5 px-5 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition">
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
                                    <button onClick={() => handleDelete(selected._id)} className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm font-semibold hover:bg-gray-50 transition ml-auto">
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                        <h3 className="text-lg font-bold text-[#1E3A8A] mb-4 flex items-center gap-2"><Send size={18} /> Forward to Transport Company</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name *</label>
                                <input type="text" value={forwardData.companyName} onChange={e => setForwardData({ ...forwardData, companyName: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Lanka Cabs (Pvt) Ltd" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Reference / Confirmation #</label>
                                <input type="text" value={forwardData.reference} onChange={e => setForwardData({ ...forwardData, reference: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. LC-2026-0042" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                                <textarea value={forwardData.notes} onChange={e => setForwardData({ ...forwardData, notes: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none h-20 resize-none" placeholder="Additional notes..." />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowForward(false)} className="px-5 py-3 rounded-lg border text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={() => doAction('forward', forwardData)} disabled={!forwardData.companyName} className="flex-1 px-5 py-3 rounded-lg bg-purple-600 text-white text-sm font-bold hover:bg-purple-700 disabled:opacity-50 transition">
                                Send to Company
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showReject && selected && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                        <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2"><XCircle size={18} /> Reject Transport Request</h3>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Rejection Reason *</label>
                            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none" placeholder="Reason for rejection..." />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowReject(false)} className="px-5 py-3 rounded-lg border text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
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
