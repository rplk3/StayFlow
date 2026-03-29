import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Percent, RefreshCw } from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getForecast } from '../../../services/api';

const dk = { card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8', grid: '#2d3039' };

const DarkTooltip = ({ active, payload, label, formatter }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg px-4 py-3 shadow-xl border text-sm" style={{ background: dk.elevated, borderColor: dk.border }}>
            <p className="text-xs font-medium mb-1" style={{ color: dk.textSec }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="font-bold" style={{ color: p.color }}>
                    {formatter ? formatter(p.value, p.name)[0] : p.value}
                </p>
            ))}
        </div>
    );
};

const Forecasting = () => {
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(7);

    const fetchForecast = async () => {
        setLoading(true);
        try {
            const res = await getForecast(days);
            setForecast(res.data);
        } catch (e) {
            console.error('Failed to fetch forecast:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForecast();
    }, [days]);

    const avgRevenue = forecast.length > 0
        ? Math.round(forecast.reduce((s, f) => s + f.predictedRevenue, 0) / forecast.length)
        : 0;
    const avgOccupancy = forecast.length > 0
        ? (forecast.reduce((s, f) => s + f.predictedOccupancy, 0) / forecast.length).toFixed(1)
        : 0;
    const totalProjected = forecast.reduce((s, f) => s + f.predictedRevenue, 0);

    const summaryCards = [
        { label: 'Predicted Avg Occupancy', value: `${avgOccupancy}%`, icon: Calendar, color: '#6366f1' },
        { label: 'Avg Daily Revenue', value: `Rs. ${avgRevenue.toLocaleString()}`, icon: DollarSign, color: '#10b981' },
        { label: 'Total Projected Revenue', value: `Rs. ${totalProjected.toLocaleString()}`, icon: TrendingUp, color: '#3b82f6' },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: dk.text }}>Predictive Forecasting</h1>
                    <p className="text-sm mt-1" style={{ color: dk.textSec }}>
                        Baseline forecasting using 30-day moving average.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={days} onChange={(e) => setDays(Number(e.target.value))}
                        className="text-sm rounded-lg px-3 py-2 outline-none border focus:ring-2 focus:ring-indigo-500"
                        style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                        <option value={7}>Next 7 Days</option>
                        <option value={14}>Next 14 Days</option>
                        <option value={30}>Next 30 Days</option>
                    </select>
                    <button onClick={fetchForecast} disabled={loading}
                        className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
                        style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryCards.map((c, i) => {
                    const Icon = c.icon;
                    return (
                        <div key={i} className="rounded-xl p-6 border" style={{ background: dk.card, borderColor: dk.border }}>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl" style={{ background: `${c.color}15` }}>
                                    <Icon className="w-6 h-6" style={{ color: c.color }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: dk.textSec }}>{c.label}</p>
                                    <h3 className="text-2xl font-bold" style={{ color: dk.text }}>{c.value}</h3>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
                </div>
            ) : forecast.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Forecast */}
                    <div className="rounded-xl p-6 border" style={{ background: dk.card, borderColor: dk.border }}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: dk.text }}>
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            Revenue Forecast
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={forecast}>
                                    <defs>
                                        <linearGradient id="forecastRevGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dk.grid} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: dk.textSec }} tickMargin={10} />
                                    <YAxis tick={{ fontSize: 11, fill: dk.textSec }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={55} />
                                    <Tooltip content={<DarkTooltip formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Predicted Revenue']} />} />
                                    <Area type="monotone" dataKey="predictedRevenue" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="6 3" fill="url(#forecastRevGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Occupancy Forecast */}
                    <div className="rounded-xl p-6 border" style={{ background: dk.card, borderColor: dk.border }}>
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: dk.text }}>
                            <Percent className="w-5 h-5 text-emerald-400" />
                            Occupancy Forecast
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={forecast}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dk.grid} />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: dk.textSec }} tickMargin={10} />
                                    <YAxis tick={{ fontSize: 11, fill: dk.textSec }} tickFormatter={(v) => `${v}%`} width={55} domain={[0, 100]} />
                                    <Tooltip content={<DarkTooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Predicted Occupancy']} />} />
                                    <Bar dataKey="predictedOccupancy" fill="#10B981" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64" style={{ color: dk.textSec }}>
                    <TrendingUp className="w-12 h-12 mb-3" />
                    <p className="text-lg font-medium">No forecast data</p>
                    <p className="text-sm mt-1">Ensure daily analytics have been rebuilt first.</p>
                </div>
            )}
        </div>
    );
};

export default Forecasting;
