import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, ShieldAlert, ShieldCheck, Circle, CircleCheck } from 'lucide-react';
import { getAlerts, checkAnomalies, resolveAlert } from '../../../services/api';

const dk = { card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8' };

const severityConfig = {
    HIGH: { bg: '#ef444412', border: '#ef4444', text: '#fca5a5', badge: { bg: '#ef444420', color: '#f87171' } },
    MEDIUM: { bg: '#f59e0b12', border: '#f59e0b', text: '#fcd34d', badge: { bg: '#f59e0b20', color: '#fbbf24' } },
    LOW: { bg: '#3b82f612', border: '#3b82f6', text: '#93c5fd', badge: { bg: '#3b82f620', color: '#60a5fa' } }
};

const typeLabels = {
    REVENUE_LEAK: 'Revenue Leak',
    REVENUE_DROP: 'Revenue Drop',
    HIGH_CANCELLATION: 'High Cancellations',
    SUSPICIOUS_ACTIVITY: 'Suspicious Activity'
};

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [statusFilter, setStatusFilter] = useState('ACTIVE');
    const [resolvingId, setResolvingId] = useState(null);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await getAlerts(statusFilter);
            setAlerts(res.data);
        } catch (e) {
            console.error('Failed to fetch alerts:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, [statusFilter]);

    const handleCheckAnomalies = async () => {
        setChecking(true);
        try {
            await checkAnomalies();
            await fetchAlerts();
        } catch (e) {
            console.error('Failed to check anomalies:', e);
        } finally {
            setChecking(false);
        }
    };

    const handleResolve = async (id) => {
        setResolvingId(id);
        try {
            await resolveAlert(id);
            await fetchAlerts();
        } catch (e) {
            console.error('Failed to resolve alert:', e);
        } finally {
            setResolvingId(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: dk.text }}>Anomaly Detection & Alerts</h1>
                    <p className="text-sm mt-1" style={{ color: dk.textSec }}>Rule-based alerts for revenue leaks, drops, and high cancellations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCheckAnomalies}
                        disabled={checking}
                        className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 text-white"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    >
                        <ShieldAlert className={`w-4 h-4 mr-2 ${checking ? 'animate-pulse' : ''}`} />
                        {checking ? 'Scanning...' : 'Run Anomaly Check'}
                    </button>
                </div>
            </div>

            {/* Status Filter Tabs — icons instead of emojis */}
            <div className="flex gap-2">
                {[
                    { status: 'ACTIVE', label: 'Active', icon: Circle, color: '#ef4444' },
                    { status: 'RESOLVED', label: 'Resolved', icon: CircleCheck, color: '#10b981' },
                    { status: '', label: 'All', icon: null, color: null }
                ].map(({ status, label, icon: Icon, color }) => (
                    <button
                        key={status || 'all'}
                        onClick={() => setStatusFilter(status)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border"
                        style={statusFilter === status
                            ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', borderColor: 'transparent' }
                            : { background: dk.elevated, borderColor: dk.border, color: dk.textSec }
                        }
                    >
                        {Icon && <Icon className="w-3.5 h-3.5" style={statusFilter !== status && color ? { color } : {}} />}
                        {label}
                    </button>
                ))}
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="rounded-xl p-12 text-center border" style={{ background: dk.card, borderColor: dk.border }}>
                        <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-60 text-emerald-500" />
                        <h3 className="text-lg font-semibold" style={{ color: dk.text }}>All Clear!</h3>
                        <p className="text-sm mt-2" style={{ color: dk.textSec }}>
                            {statusFilter === 'ACTIVE' ? 'No active anomalies detected.' : 'No alerts found for this filter.'}
                        </p>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const config = severityConfig[alert.severity] || severityConfig.LOW;
                        return (
                            <div
                                key={alert._id}
                                className="rounded-xl p-5 border-l-4 transition-all hover:translate-x-0.5"
                                style={{ background: config.bg, borderLeftColor: config.border }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: config.border }} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h4 className="font-semibold text-sm" style={{ color: config.text }}>
                                                    {typeLabels[alert.type] || alert.type}
                                                </h4>
                                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                    style={{ background: config.badge.bg, color: config.badge.color }}>
                                                    {alert.severity}
                                                </span>
                                                {alert.status === 'RESOLVED' && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                        style={{ background: '#10b98120', color: '#34d399' }}>
                                                        RESOLVED
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm opacity-80 mt-1" style={{ color: config.text }}>{alert.description}</p>
                                            <p className="text-xs mt-2" style={{ color: dk.textSec }}>
                                                {new Date(alert.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {alert.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => handleResolve(alert._id)}
                                            disabled={resolvingId === alert._id}
                                            className="ml-4 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex-shrink-0 border"
                                            style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            {resolvingId === alert._id ? 'Resolving...' : 'Resolve'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Alerts;
