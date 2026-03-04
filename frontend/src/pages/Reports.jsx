import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter, RefreshCw, BarChart3, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateReport, getReportPdfUrl } from '../services/api';

const reportTypes = [
    { value: 'revenue', label: 'Revenue Report', icon: '💰' },
    { value: 'occupancy', label: 'Occupancy Report', icon: '🏨' },
    { value: 'bookings', label: 'Bookings Report', icon: '📋' },
    { value: 'alerts', label: 'Alerts Report', icon: '🚨' }
];

const Reports = () => {
    const [reportType, setReportType] = useState('revenue');
    const [from, setFrom] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await generateReport(reportType, from, to);
            setReportData(res.data);
        } catch (e) {
            console.error('Failed to generate report:', e);
            setError('Failed to generate report. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        const url = getReportPdfUrl(reportType, from, to);
        window.open(url, '_blank');
    };

    const getSummaryItems = () => {
        if (!reportData?.summary) return [];
        return Object.entries(reportData.summary).map(([key, value]) => ({
            label: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
            value: typeof value === 'number' ? value.toLocaleString() : value
        }));
    };

    const getTableHeaders = () => {
        if (!reportData?.tableRows?.length) return [];
        return Object.keys(reportData.tableRows[0]);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div>
                <h1 className="text-2xl font-bold text-textPrimary">Reports & Exports</h1>
                <p className="text-textSecondary text-sm mt-1">Generate data-driven reports with preview and PDF download.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="bg-card rounded-xl shadow-soft border border-gray-100 p-6">
                    <h3 className="text-sm font-semibold text-textPrimary uppercase tracking-wider mb-4">
                        Report Configuration
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-textSecondary mb-1.5 flex items-center">
                                <FileText className="w-4 h-4 mr-2" /> Report Type
                            </label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary p-2.5 shadow-sm"
                            >
                                {reportTypes.map(rt => (
                                    <option key={rt.value} value={rt.value}>{rt.icon} {rt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textSecondary mb-1.5 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" /> From Date
                            </label>
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary p-2.5 shadow-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-textSecondary mb-1.5 flex items-center">
                                <Calendar className="w-4 h-4 mr-2" /> To Date
                            </label>
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary p-2.5 shadow-sm"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full flex items-center justify-center bg-secondary hover:bg-secondary/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center"><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</span>
                            ) : (
                                <span className="flex items-center"><BarChart3 className="w-4 h-4 mr-2" /> Generate Report</span>
                            )}
                        </button>

                        {reportData && (
                            <button
                                onClick={handleDownloadPDF}
                                className="w-full flex items-center justify-center bg-accent hover:bg-accent/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                            >
                                <Download className="w-4 h-4 mr-2" /> Download PDF
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {!reportData && !loading && (
                        <div className="bg-card rounded-xl shadow-soft border border-gray-100 p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-textPrimary">Select & Generate</h3>
                            <p className="text-textSecondary text-sm mt-2">Choose a report type and date range, then click Generate to see the preview.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="bg-card rounded-xl shadow-soft border border-gray-100 p-12 text-center">
                            <RefreshCw className="w-10 h-10 text-primary mx-auto mb-4 animate-spin" />
                            <p className="text-textSecondary text-sm">Generating report...</p>
                        </div>
                    )}

                    {reportData && !loading && (
                        <>
                            {/* Summary Cards */}
                            <div className="bg-card rounded-xl shadow-soft border border-gray-100 p-6">
                                <h3 className="text-sm font-semibold text-textPrimary uppercase tracking-wider mb-4 flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-2 text-primary" /> Summary
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {getSummaryItems().map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs text-textSecondary font-medium">{item.label}</p>
                                            <p className="text-lg font-bold text-textPrimary mt-1">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chart */}
                            {reportData.chartSeries?.length > 0 && (
                                <div className="bg-card rounded-xl shadow-soft border border-gray-100 p-6">
                                    <h3 className="text-sm font-semibold text-textPrimary uppercase tracking-wider mb-4">
                                        Trend Chart
                                    </h3>
                                    <div className="h-56">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={reportData.chartSeries}>
                                                <defs>
                                                    <linearGradient id="reportChartGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} tickMargin={8} minTickGap={30} />
                                                <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} width={50} />
                                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} fill="url(#reportChartGrad)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Data Table */}
                            {reportData.tableRows?.length > 0 && (
                                <div className="bg-card rounded-xl shadow-soft border border-gray-100 overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-textPrimary uppercase tracking-wider flex items-center">
                                            <Filter className="w-4 h-4 mr-2 text-primary" /> Data Preview
                                        </h3>
                                        <span className="text-xs bg-blue-100 text-primary px-2 py-1 rounded-full font-medium">
                                            {reportData.tableRows.length} rows
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto max-h-96">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                                <tr>
                                                    {getTableHeaders().map(h => (
                                                        <th key={h} scope="col" className="px-4 py-3 font-semibold">
                                                            {h.charAt(0).toUpperCase() + h.slice(1)}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.tableRows.map((row, idx) => (
                                                    <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                                                        {getTableHeaders().map(h => (
                                                            <td key={h} className="px-4 py-3 text-gray-700">
                                                                {typeof row[h] === 'number' ? row[h].toLocaleString() : row[h]}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
