import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Briefcase, Percent, BellDot, RefreshCw, Database, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import ChartsSection from '../components/ChartsSection';
import { getDashboardData, rebuildDaily } from '../../../services/api';

/* ── Dark theme tokens ── */
const dk = { bg: '#0f1117', card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8' };

/* ── Interactive Date Range Picker ── */
const DateRangePicker = ({ from, to, setFrom, setTo }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    // Limits: max 90 days back, max today
    const today = new Date().toISOString().split('T')[0];
    const minDate = (() => { const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().split('T')[0]; })();

    // Quick range presets
    const presets = [
        { label: 'Last 7 days', days: 7 },
        { label: 'Last 14 days', days: 14 },
        { label: 'Last 30 days', days: 30 },
        { label: 'Last 60 days', days: 60 },
        { label: 'Last 90 days', days: 90 },
    ];

    const applyPreset = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setFrom(start.toISOString().split('T')[0]);
        setTo(end.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const formatDisplay = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border"
                style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}
            >
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span>{formatDisplay(from)}</span>
                <span style={{ color: dk.textSec }}>→</span>
                <span>{formatDisplay(to)}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 rounded-xl shadow-2xl border p-4 w-80"
                    style={{ background: dk.card, borderColor: dk.border }}>
                    {/* Presets */}
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: dk.textSec }}>Quick Select</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {presets.map(p => (
                            <button key={p.days} onClick={() => applyPreset(p.days)}
                                className="text-xs font-medium px-3 py-2 rounded-lg transition-all hover:bg-indigo-500/20 text-left"
                                style={{ background: dk.elevated, color: dk.text }}>
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom range */}
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: dk.textSec }}>Custom Range</p>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: dk.textSec }}>From</label>
                            <input type="date" value={from} min={minDate} max={to || today}
                                onChange={(e) => setFrom(e.target.value)}
                                className="w-full text-sm rounded-lg px-3 py-2 outline-none border focus:ring-2 focus:ring-indigo-500"
                                style={{ background: dk.elevated, borderColor: dk.border, color: dk.text, colorScheme: 'dark' }} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: dk.textSec }}>To</label>
                            <input type="date" value={to} min={from || minDate} max={today}
                                onChange={(e) => setTo(e.target.value)}
                                className="w-full text-sm rounded-lg px-3 py-2 outline-none border focus:ring-2 focus:ring-indigo-500"
                                style={{ background: dk.elevated, borderColor: dk.border, color: dk.text, colorScheme: 'dark' }} />
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)}
                        className="w-full mt-4 py-2 rounded-lg text-sm font-semibold text-white transition hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rebuilding, setRebuilding] = useState(false);
    const [from, setFrom] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getDashboardData(from, to);
            setData(res.data);
        } catch (e) {
            console.error('Failed to fetch dashboard data:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleRebuild = async () => {
        setRebuilding(true);
        try {
            await rebuildDaily();
            await fetchData();
        } catch (e) {
            console.error('Failed to rebuild:', e);
        } finally {
            setRebuilding(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [from, to]);

    return (
        <div className="animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: dk.text }}>Analytics Dashboard</h1>
                    <p className="text-sm mt-1" style={{ color: dk.textSec }}>Monitor revenue, bookings, and alerts in real-time.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <DateRangePicker from={from} to={to} setFrom={setFrom} setTo={setTo} />
                    <button
                        onClick={handleRebuild}
                        disabled={rebuilding}
                        className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 text-white"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                        <Database className={`w-4 h-4 mr-2 ${rebuilding ? 'animate-pulse' : ''}`} />
                        {rebuilding ? 'Rebuilding...' : 'Rebuild Daily'}
                    </button>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                        style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {loading && !data ? (
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
                </div>
            ) : data ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard title="Total Revenue" value={`Rs. ${(data.totalRevenue || 0).toLocaleString()}`}
                            icon={DollarSign} accentColor="#10b981" />
                        <StatsCard title="Total Bookings" value={(data.totalBookings || 0).toLocaleString()}
                            icon={Briefcase} accentColor="#6366f1" />
                        <StatsCard title="Avg Occupancy" value={`${(data.avgOccupancy || 0).toFixed(1)}%`}
                            icon={Percent} accentColor="#3b82f6" />
                        <StatsCard title="Active Alerts" value={(data.activeAlertsCount || 0).toString()}
                            icon={BellDot} accentColor="#ef4444" />
                    </div>

                    <ChartsSection data={data} />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-64" style={{ color: dk.textSec }}>
                    <Database className="w-12 h-12 mb-3" />
                    <p className="text-lg font-medium">No data available</p>
                    <p className="text-sm mt-1">Click "Rebuild Daily" to aggregate analytics from bookings.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
