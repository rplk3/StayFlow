import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter, RefreshCw, BarChart3, TrendingUp, DollarSign, Hotel, ClipboardList, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateReport, getReportPdfUrl } from '../../../services/api';

const dk = { bg: '#0f1117', card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8', grid: '#2d3039' };

const reportTypes = [
    { value: 'revenue', label: 'Revenue Report', icon: DollarSign, color: '#10b981' },
    { value: 'occupancy', label: 'Occupancy Report', icon: Hotel, color: '#6366f1' },
    { value: 'bookings', label: 'Bookings Report', icon: ClipboardList, color: '#3b82f6' },
    { value: 'alerts', label: 'Alerts Report', icon: ShieldAlert, color: '#ef4444' }
];

const DarkTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg px-4 py-3 shadow-xl border text-sm" style={{ background: dk.elevated, borderColor: dk.border }}>
            <p className="text-xs font-medium mb-1" style={{ color: dk.textSec }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} className="font-bold" style={{ color: p.color }}>{Number(p.value).toLocaleString()}</p>
            ))}
        </div>
    );
};

const Reports = () => {
    const [reportType, setReportType] = useState('revenue');
    const today = new Date().toISOString().split('T')[0];
    const minDate = (() => { const d = new Date(); d.setDate(d.getDate() - 90); return d.toISOString().split('T')[0]; })();
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

    const currentType = reportTypes.find(r => r.value === reportType);

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: dk.text }}>Reports & Exports</h1>
                <p className="text-sm mt-1" style={{ color: dk.textSec }}>Generate data-driven reports with preview and PDF download.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="rounded-xl border p-6" style={{ background: dk.card, borderColor: dk.border }}>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: dk.textSec }}>
                        Report Configuration
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1.5 flex items-center" style={{ color: dk.textSec }}>
                                <FileText className="w-4 h-4 mr-2" /> Report Type
                            </label>
                            {/* Report type cards */}
                            <div className="space-y-2 mt-2">
                                {reportTypes.map(rt => {
                                    const Icon = rt.icon;
                                    const selected = reportType === rt.value;
                                    return (
                                        <button key={rt.value} onClick={() => setReportType(rt.value)}
                                            className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm font-medium transition-all border"
                                            style={{
                                                background: selected ? `${rt.color}15` : dk.elevated,
                                                borderColor: selected ? rt.color : dk.border,
                                                color: selected ? rt.color : dk.text
                                            }}>
                                            <Icon className="w-4 h-4" />
                                            {rt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center" style={{ color: dk.textSec }}>
                                <Calendar className="w-4 h-4 mr-2" /> From Date
                            </label>
                            <input type="date" value={from} min={minDate} max={to || today}
                                onChange={(e) => setFrom(e.target.value)}
                                className="w-full text-sm rounded-lg p-2.5 outline-none border focus:ring-2 focus:ring-indigo-500"
                                style={{ background: dk.elevated, borderColor: dk.border, color: dk.text, colorScheme: 'dark' }} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5 flex items-center" style={{ color: dk.textSec }}>
                                <Calendar className="w-4 h-4 mr-2" /> To Date
                            </label>
                            <input type="date" value={to} min={from || minDate} max={today}
                                onChange={(e) => setTo(e.target.value)}
                                className="w-full text-sm rounded-lg p-2.5 outline-none border focus:ring-2 focus:ring-indigo-500"
                                style={{ background: dk.elevated, borderColor: dk.border, color: dk.text, colorScheme: 'dark' }} />
                        </div>

                        <button onClick={handleGenerate} disabled={loading}
                            className="w-full flex items-center justify-center text-white font-semibold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            {loading ? (
                                <span className="flex items-center"><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating...</span>
                            ) : (
                                <span className="flex items-center"><BarChart3 className="w-4 h-4 mr-2" /> Generate Report</span>
                            )}
                        </button>

                        {reportData && (
                            <button onClick={handleDownloadPDF}
                                className="w-full flex items-center justify-center font-semibold py-2.5 px-4 rounded-lg transition-all text-white"
                                style={{ background: '#10b981' }}>
                                <Download className="w-4 h-4 mr-2" /> Download PDF
                            </button>
                        )}
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {error && (
                        <div className="rounded-xl p-4 text-sm border" style={{ background: '#ef444415', borderColor: '#ef4444', color: '#fca5a5' }}>
                            {error}
                        </div>
                    )}

                    {!reportData && !loading && (
                        <div className="rounded-xl border p-12 text-center" style={{ background: dk.card, borderColor: dk.border }}>
                            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: dk.border }} />
                            <h3 className="text-lg font-semibold" style={{ color: dk.text }}>Select & Generate</h3>
                            <p className="text-sm mt-2" style={{ color: dk.textSec }}>Choose a report type and date range, then click Generate to see the preview.</p>
                        </div>
                    )}

                    {loading && (
                        <div className="rounded-xl border p-12 text-center" style={{ background: dk.card, borderColor: dk.border }}>
                            <RefreshCw className="w-10 h-10 mx-auto mb-4 animate-spin text-indigo-500" />
                            <p className="text-sm" style={{ color: dk.textSec }}>Generating report...</p>
                        </div>
                    )}

                    {reportData && !loading && (
                        <>
                            {/* Summary Cards */}
                            <div className="rounded-xl border p-6" style={{ background: dk.card, borderColor: dk.border }}>
                                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 flex items-center" style={{ color: dk.textSec }}>
                                    <TrendingUp className="w-4 h-4 mr-2 text-indigo-400" /> Summary
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {getSummaryItems().map((item, idx) => (
                                        <div key={idx} className="rounded-lg p-3 border" style={{ background: dk.elevated, borderColor: dk.border }}>
                                            <p className="text-xs font-medium" style={{ color: dk.textSec }}>{item.label}</p>
                                            <p className="text-lg font-bold mt-1" style={{ color: dk.text }}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Chart */}
                            {reportData.chartSeries?.length > 0 && (
                                <div className="rounded-xl border p-6" style={{ background: dk.card, borderColor: dk.border }}>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: dk.textSec }}>Trend Chart</h3>
                                    <div className="h-56">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={reportData.chartSeries}>
                                                <defs>
                                                    <linearGradient id="reportChartGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dk.grid} />
                                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: dk.textSec }} tickMargin={8} minTickGap={30} />
                                                <YAxis tick={{ fontSize: 10, fill: dk.textSec }} width={50} />
                                                <Tooltip content={<DarkTooltip />} />
                                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#reportChartGrad)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {/* Data Table */}
                            {reportData.tableRows?.length > 0 && (
                                <div className="rounded-xl border overflow-hidden" style={{ background: dk.card, borderColor: dk.border }}>
                                    <div className="p-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${dk.border}` }}>
                                        <h3 className="text-sm font-semibold uppercase tracking-wider flex items-center" style={{ color: dk.textSec }}>
                                            <Filter className="w-4 h-4 mr-2 text-indigo-400" /> Data Preview
                                        </h3>
                                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: '#6366f115', color: '#818cf8' }}>
                                            {reportData.tableRows.length} rows
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto max-h-96">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs uppercase sticky top-0" style={{ background: dk.elevated, color: dk.textSec }}>
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
                                                    <tr key={idx} className="transition-colors" style={{ borderBottom: `1px solid ${dk.border}` }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = dk.elevated}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                                        {getTableHeaders().map(h => (
                                                            <td key={h} className="px-4 py-3" style={{ color: dk.text }}>
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
