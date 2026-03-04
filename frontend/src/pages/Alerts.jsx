import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, ShieldAlert, ShieldCheck, Filter } from 'lucide-react';
import { getAlerts, checkAnomalies, resolveAlert } from '../services/api';

const severityConfig = {
    HIGH: { bg: 'bg-red-50', border: 'border-red-400', text: 'text-red-700', badge: 'bg-red-100 text-red-800' },
    MEDIUM: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
    LOW: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-800' }
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
                    <h1 className="text-2xl font-bold text-textPrimary">Anomaly Detection & Alerts</h1>
                    <p className="text-textSecondary text-sm mt-1">Rule-based alerts for revenue leaks, drops, and high cancellations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCheckAnomalies}
                        disabled={checking}
                        className="flex items-center bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                        <ShieldAlert className={`w-4 h-4 mr-2 ${checking ? 'animate-pulse' : ''}`} />
                        {checking ? 'Scanning...' : 'Run Anomaly Check'}
                    </button>
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2">
                {['ACTIVE', 'RESOLVED', ''].map((status) => (
                    <button
                        key={status || 'all'}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {status === '' ? 'All' : status === 'ACTIVE' ? '🔴 Active' : '✅ Resolved'}
                    </button>
                ))}
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-48">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="bg-card rounded-xl shadow-soft p-12 text-center border border-gray-100">
                        <ShieldCheck className="w-16 h-16 text-accent mx-auto mb-4 opacity-60" />
                        <h3 className="text-lg font-semibold text-textPrimary">All Clear!</h3>
                        <p className="text-textSecondary text-sm mt-2">
                            {statusFilter === 'ACTIVE' ? 'No active anomalies detected.' : 'No alerts found for this filter.'}
                        </p>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const config = severityConfig[alert.severity] || severityConfig.LOW;
                        return (
                            <div
                                key={alert._id}
                                className={`${config.bg} rounded-xl p-5 border-l-4 ${config.border} shadow-sm transition-all hover:shadow-md`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.text}`} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h4 className={`font-semibold text-sm ${config.text}`}>
                                                    {typeLabels[alert.type] || alert.type}
                                                </h4>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                                                    {alert.severity}
                                                </span>
                                                {alert.status === 'RESOLVED' && (
                                                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800">
                                                        RESOLVED
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm ${config.text} opacity-80 mt-1`}>{alert.description}</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {new Date(alert.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {alert.status === 'ACTIVE' && (
                                        <button
                                            onClick={() => handleResolve(alert._id)}
                                            disabled={resolvingId === alert._id}
                                            className="ml-4 flex items-center gap-1 bg-white/80 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 hover:bg-white transition-colors shadow-sm disabled:opacity-50 flex-shrink-0"
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
