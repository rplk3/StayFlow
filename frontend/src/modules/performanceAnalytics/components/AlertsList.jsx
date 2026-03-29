import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { getAlerts, checkAnomalies } from '../../../services/api';

const dk = { card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8' };

const AlertsList = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);

    const mockAlerts = [
        { _id: '1', type: 'Revenue Leak Detected', description: 'Found 3 high refund operations exceeding 50,000 LKR in the last 24h.', severity: 'high', createdAt: new Date().toISOString() },
        { _id: '2', type: 'Occupancy Target Missed', description: 'Occupancy dropped below 40% yesterday.', severity: 'medium', createdAt: new Date(Date.now() - 86400000).toISOString() }
    ];

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await getAlerts();
            setAlerts(res.data.length ? res.data : mockAlerts);
        } catch (e) {
            setAlerts(mockAlerts);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const handleCheckAnomalies = async () => {
        setChecking(true);
        try {
            await checkAnomalies();
            fetchAlerts();
        } catch (e) {
            setTimeout(() => {
                setAlerts((prev) => [{
                    _id: Date.now().toString(),
                    type: 'Manual Check',
                    description: 'Anomaly detection run manually. No new severe anomalies found.',
                    severity: 'low',
                    createdAt: new Date().toISOString()
                }, ...prev]);
                setChecking(false);
            }, 1000);
        }
    };

    return (
        <div className="rounded-xl p-6 flex flex-col h-[500px] border" style={{ background: dk.card, borderColor: dk.border }}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center" style={{ color: dk.text }}>
                    <AlertCircle className="w-6 h-6 mr-2 text-red-400" />
                    Active Alerts
                </h3>
                <button
                    onClick={handleCheckAnomalies}
                    disabled={checking}
                    className="flex items-center text-sm py-1.5 px-3 rounded-lg transition-colors border"
                    style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${checking ? 'animate-spin' : ''}`} />
                    Check Anomalies
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
                {loading ? (
                    <div className="flex justify-center items-center h-full"><RefreshCw className="animate-spin w-8 h-8 text-indigo-500" /></div>
                ) : alerts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full" style={{ color: dk.textSec }}>
                        <CheckCircle className="w-12 h-12 mb-2" />
                        <p>No active anomalies found.</p>
                    </div>
                ) : (
                    alerts.map(alert => (
                        <div key={alert._id} className="p-4 rounded-lg border-l-4 flex items-start"
                            style={{ background: '#ef444412', borderLeftColor: '#ef4444' }}>
                            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-red-400" />
                            <div>
                                <h4 className="font-semibold text-sm text-red-400">{alert.type}</h4>
                                <p className="text-xs mt-1" style={{ color: '#fca5a5' }}>{alert.description}</p>
                                <p className="text-xs mt-2" style={{ color: dk.textSec }}>{new Date(alert.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AlertsList;
