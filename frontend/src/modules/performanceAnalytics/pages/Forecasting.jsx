import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Percent, BarChart3, RefreshCw } from 'lucide-react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { getForecast } from '../../../services/api';

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

    // Calculate summaries from forecast data
    const avgRevenue = forecast.length > 0
        ? Math.round(forecast.reduce((s, f) => s + f.predictedRevenue, 0) / forecast.length)
        : 0;
    const avgOccupancy = forecast.length > 0
        ? (forecast.reduce((s, f) => s + f.predictedOccupancy, 0) / forecast.length).toFixed(1)
        : 0;
    const totalProjected = forecast.reduce((s, f) => s + f.predictedRevenue, 0);

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-textPrimary">Predictive Forecasting</h1>
                    <p className="text-textSecondary text-sm mt-1">
                        Baseline forecasting using 30-day moving average.
                        <span className="text-xs text-gray-400 ml-2 italic">ML model training planned for Progress 2.</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="bg-white border border-gray-200 text-sm rounded-lg px-3 py-2 shadow-sm focus:ring-primary focus:border-primary"
                    >
                        <option value={7}>Next 7 Days</option>
                        <option value={14}>Next 14 Days</option>
                        <option value={30}>Next 30 Days</option>
                    </select>
                    <button
                        onClick={fetchForecast}
                        disabled={loading}
                        className="flex items-center bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card rounded-xl shadow-soft p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary/10 rounded-lg text-secondary">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-textSecondary font-medium">Predicted Avg Occupancy</p>
                            <h3 className="text-2xl font-bold text-textPrimary">{avgOccupancy}%</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl shadow-soft p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-lg text-accent">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-textSecondary font-medium">Avg Daily Revenue</p>
                            <h3 className="text-2xl font-bold text-textPrimary">Rs. {avgRevenue.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl shadow-soft p-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-textSecondary font-medium">Total Projected Revenue</p>
                            <h3 className="text-2xl font-bold text-textPrimary">Rs. {totalProjected.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <RefreshCw className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : forecast.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Forecast */}
                    <div className="bg-card rounded-xl p-6 shadow-soft border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-textPrimary flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-secondary" />
                            Revenue Forecast
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={forecast}>
                                    <defs>
                                        <linearGradient id="forecastRevGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} tickMargin={10} />
                                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={55} />
                                    <Tooltip
                                        formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Predicted Revenue']}
                                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="predictedRevenue" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="6 3" fill="url(#forecastRevGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Occupancy Forecast */}
                    <div className="bg-card rounded-xl p-6 shadow-soft border border-gray-100">
                        <h3 className="text-lg font-semibold mb-4 text-textPrimary flex items-center gap-2">
                            <Percent className="w-5 h-5 text-accent" />
                            Occupancy Forecast
                        </h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={forecast}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} tickMargin={10} />
                                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `${v}%`} width={55} domain={[0, 100]} />
                                    <Tooltip
                                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Predicted Occupancy']}
                                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="predictedOccupancy" fill="#10B981" radius={[6, 6, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <TrendingUp className="w-12 h-12 mb-3" />
                    <p className="text-lg font-medium">No forecast data</p>
                    <p className="text-sm mt-1">Ensure daily analytics have been rebuilt first.</p>
                </div>
            )}
        </div>
    );
};

export default Forecasting;
