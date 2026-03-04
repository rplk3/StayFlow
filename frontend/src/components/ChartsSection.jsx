import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartsSection = ({ data }) => {
    const revenueData = data.revenueSeries?.map(d => ({
        ...d,
        date: d.date
    })) || [];

    const occupancyData = data.occupancySeries?.map(d => ({
        ...d,
        date: d.date
    })) || [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Revenue Chart */}
            <div className="bg-card rounded-xl p-6 shadow-soft border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-textPrimary">Revenue Trend</h3>
                <div className="h-64">
                    {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} tickMargin={10} minTickGap={40} />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={55} />
                                <Tooltip
                                    formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, 'Revenue']}
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '13px' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fill="url(#revenueGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">No revenue data available</div>
                    )}
                </div>
            </div>

            {/* Occupancy Chart */}
            <div className="bg-card rounded-xl p-6 shadow-soft border border-gray-100">
                <h3 className="text-lg font-semibold mb-4 text-textPrimary">Occupancy Rate</h3>
                <div className="h-64">
                    {occupancyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={occupancyData}>
                                <defs>
                                    <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} tickMargin={10} minTickGap={40} />
                                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => `${v}%`} width={55} domain={[0, 100]} />
                                <Tooltip
                                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Occupancy']}
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '13px' }}
                                />
                                <Area type="monotone" dataKey="occupancy" stroke="#10B981" strokeWidth={2.5} fill="url(#occupancyGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">No occupancy data available</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChartsSection;
