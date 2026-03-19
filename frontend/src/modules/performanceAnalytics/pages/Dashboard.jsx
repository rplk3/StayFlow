import React, { useState, useEffect } from 'react';
import { DollarSign, Briefcase, Percent, BellDot, RefreshCw, Database, Calendar } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import ChartsSection from '../components/ChartsSection';
import { getDashboardData, rebuildDaily } from '../../../services/api';

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
                    <h1 className="text-2xl font-bold text-textPrimary">Analytics Dashboard</h1>
                    <p className="text-sm text-textSecondary mt-1">Monitor revenue, bookings, and alerts in real-time.</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <input
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="text-sm border-none outline-none bg-transparent text-gray-700"
                        />
                        <span className="text-gray-400">→</span>
                        <input
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="text-sm border-none outline-none bg-transparent text-gray-700"
                        />
                    </div>
                    <button
                        onClick={handleRebuild}
                        disabled={rebuilding}
                        className="flex items-center bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <Database className={`w-4 h-4 mr-2 ${rebuilding ? 'animate-pulse' : ''}`} />
                        {rebuilding ? 'Rebuilding...' : 'Rebuild Daily'}
                    </button>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {loading && !data ? (
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : data ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            title="Total Revenue"
                            value={`Rs. ${(data.totalRevenue || 0).toLocaleString()}`}
                            icon={DollarSign}
                            colorClass="bg-accent"
                        />
                        <StatsCard
                            title="Total Bookings"
                            value={(data.totalBookings || 0).toLocaleString()}
                            icon={Briefcase}
                            colorClass="bg-secondary"
                        />
                        <StatsCard
                            title="Avg Occupancy"
                            value={`${(data.avgOccupancy || 0).toFixed(1)}%`}
                            icon={Percent}
                            colorClass="bg-primary"
                        />
                        <StatsCard
                            title="Active Alerts"
                            value={(data.activeAlertsCount || 0).toString()}
                            icon={BellDot}
                            colorClass="bg-danger"
                        />
                    </div>

                    <ChartsSection data={data} />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Database className="w-12 h-12 mb-3" />
                    <p className="text-lg font-medium">No data available</p>
                    <p className="text-sm mt-1">Click "Rebuild Daily" to aggregate analytics from bookings.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
