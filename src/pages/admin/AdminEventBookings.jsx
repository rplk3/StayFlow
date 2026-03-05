import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Users, Search, Filter, BarChart3 } from 'lucide-react';
import { getAdminBookings, getBookingStats } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function AdminEventBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [filters, setFilters] = useState({ status: '', dateFrom: '', dateTo: '' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.dateFrom) params.dateFrom = filters.dateFrom;
            if (filters.dateTo) params.dateTo = filters.dateTo;
            const [bRes, sRes] = await Promise.all([getAdminBookings(params), getBookingStats({})]);
            setBookings(bRes.data.data || []);
            setStats(sRes.data.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleFilter = () => { fetchData(); };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text">Booking Requests</h1>
                    <p className="text-muted text-sm mt-1">{bookings.length} total requests</p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {[
                        { label: 'Pending', val: stats.statusCounts?.PENDING || 0, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'Approved', val: stats.statusCounts?.APPROVED || 0, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Rejected', val: stats.statusCounts?.REJECTED || 0, color: 'text-red-600', bg: 'bg-red-50' },
                        { label: 'Cancelled', val: stats.statusCounts?.CANCELLED || 0, color: 'text-gray-600', bg: 'bg-gray-50' },
                        { label: 'Revenue', val: `LKR ${(stats.totalApprovedRevenue || 0).toLocaleString()}`, color: 'text-accent', bg: 'bg-green-50' },
                    ].map(s => (
                        <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                            <p className="text-xs text-muted font-medium">{s.label}</p>
                            <p className={`text-xl font-bold ${s.color} mt-1`}>{s.val}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="bg-card rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-3 items-end" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <div className="flex-1">
                    <label className="block text-xs font-medium text-muted mb-1">Status</label>
                    <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30">
                        <option value="">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-medium text-muted mb-1">From</label>
                    <input type="date" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                </div>
                <div className="flex-1">
                    <label className="block text-xs font-medium text-muted mb-1">To</label>
                    <input type="date" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                </div>
                <button onClick={handleFilter} className="bg-secondary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary transition-colors whitespace-nowrap">
                    <Filter size={14} className="inline mr-1" /> Apply
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-muted font-medium">Ref</th>
                                    <th className="text-left px-5 py-3 text-muted font-medium">Customer</th>
                                    <th className="text-left px-5 py-3 text-muted font-medium">Hall</th>
                                    <th className="text-left px-5 py-3 text-muted font-medium">Date & Time</th>
                                    <th className="text-left px-5 py-3 text-muted font-medium">Guests</th>
                                    <th className="text-left px-5 py-3 text-muted font-medium">Total</th>
                                    <th className="text-left px-5 py-3 text-muted font-medium">Status</th>
                                    <th className="text-right px-5 py-3 text-muted font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(b => (
                                    <tr key={b._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-3 font-semibold text-primary">{b.bookingRef}</td>
                                        <td className="px-5 py-3">
                                            <p className="font-medium">{b.customerName}</p>
                                            <p className="text-xs text-muted">{b.customerEmail}</p>
                                        </td>
                                        <td className="px-5 py-3">{b.hallSnapshot?.name}</td>
                                        <td className="px-5 py-3">
                                            <p className="flex items-center gap-1"><CalendarDays size={13} className="text-muted" /> {new Date(b.eventDate).toLocaleDateString()}</p>
                                            <p className="flex items-center gap-1 text-xs text-muted"><Clock size={12} /> {b.startTime}–{b.endTime}</p>
                                        </td>
                                        <td className="px-5 py-3"><span className="flex items-center gap-1"><Users size={13} className="text-muted" /> {b.guestsCount}</span></td>
                                        <td className="px-5 py-3 font-semibold text-accent">LKR {b.pricing?.total?.toLocaleString()}</td>
                                        <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                                        <td className="px-5 py-3 text-right">
                                            <Link to={`/admin/event-bookings/${b._id}`} className="text-secondary hover:underline text-xs font-medium">View</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
