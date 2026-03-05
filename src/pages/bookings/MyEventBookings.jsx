import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Users, Search } from 'lucide-react';
import { getMyBookings } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function MyEventBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const res = await getMyBookings('all');
                setBookings(res.data.data || []);
            } catch (err) { console.error(err); }
            setLoading(false);
        })();
    }, []);

    const filtered = bookings.filter(b => {
        if (statusFilter && b.status !== statusFilter) return false;
        if (search) {
            const s = search.toLowerCase();
            return b.bookingRef?.toLowerCase().includes(s) || b.customerName?.toLowerCase().includes(s) || b.hallSnapshot?.name?.toLowerCase().includes(s);
        }
        return true;
    });

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text">My Event Bookings</h1>
                    <p className="text-muted text-sm mt-1">{bookings.length} total bookings</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30">
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-xl" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <CalendarDays size={48} className="mx-auto text-muted mb-4 opacity-30" />
                    <p className="text-muted text-lg">No bookings found</p>
                    <Link to="/halls" className="text-secondary hover:underline text-sm mt-2 inline-block">Browse halls to make a booking</Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(b => (
                        <Link key={b._id} to={`/my-event-bookings/${b._id}`} className="block">
                            <div className="bg-card rounded-xl p-5 hover:border-secondary border-2 border-transparent transition-all" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-primary text-sm">{b.bookingRef}</span>
                                            <StatusBadge status={b.status} />
                                        </div>
                                        <h3 className="font-semibold text-text">{b.hallSnapshot?.name || 'Hall'}</h3>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted">
                                            <span className="flex items-center gap-1"><CalendarDays size={14} /> {new Date(b.eventDate).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Clock size={14} /> {b.startTime} – {b.endTime}</span>
                                            <span className="flex items-center gap-1"><Users size={14} /> {b.guestsCount} guests</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted">{b.eventType}</p>
                                        <p className="text-lg font-bold text-accent">LKR {b.pricing?.total?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
