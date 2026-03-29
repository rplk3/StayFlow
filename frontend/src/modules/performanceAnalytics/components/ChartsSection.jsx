import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dk = { card: '#1a1d27', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8', grid: '#2d3039' };

const DarkTooltip = ({ active, payload, label, formatter }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg px-4 py-3 shadow-xl border text-sm"
            style={{ background: '#252830', borderColor: dk.border }}>
            <p className="text-xs font-medium mb-1" style={{ color: dk.textSec }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="font-bold" style={{ color: p.color }}>
                    {formatter ? formatter(p.value, p.name)[0] : p.value}
                </p>
            ))}
        </div>
    );
};

const ChartsSection = ({ data }) => {
    const revenueData = data.revenueSeries?.map(d => ({ ...d, date: d.date })) || [];
    const occupancyData = data.occupancySeries?.map(d => ({ ...d, date: d.date })) || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Revenue Chart */}
            <div className="rounded-xl p-6 border" style={{ background: dk.card, borderColor: dk.border }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: dk.text }}>Revenue Trend</h3>
                <div className="h-64">
                    {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dk.grid} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: dk.textSec }} tickMargin={10} minTickGap={40} />
                                <YAxis tick={{ fontSize: 11, fill: dk.textSec }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={55} />
                                <Tooltip content={<DarkTooltip formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']} />} />
                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-sm" style={{ color: dk.textSec }}>No revenue data available</div>
                    )}
                </div>
            </div>

            {/* Occupancy Chart */}
            <div className="rounded-xl p-6 border" style={{ background: dk.card, borderColor: dk.border }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: dk.text }}>Occupancy Rate</h3>
                <div className="h-64">
                    {occupancyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={occupancyData}>
                                <defs>
                                    <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dk.grid} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: dk.textSec }} tickMargin={10} minTickGap={40} />
                                <YAxis tick={{ fontSize: 11, fill: dk.textSec }} tickFormatter={(v) => `${v}%`} width={55} domain={[0, 100]} />
                                <Tooltip content={<DarkTooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Occupancy']} />} />
                                <Area type="monotone" dataKey="occupancy" stroke="#10B981" strokeWidth={2.5} fill="url(#occupancyGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-sm" style={{ color: dk.textSec }}>No occupancy data available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChartsSection;
