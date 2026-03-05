import React, { useState } from 'react';
import { CalendarDays, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { checkAvailability } from '../services/api';

export default function AvailabilityChecker({ hallId, onAvailable }) {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        if (!date || !startTime || !endTime) return;
        setLoading(true);
        try {
            const res = await checkAvailability(hallId, { eventDate: date, startTime, endTime });
            setResult(res.data);
            if (onAvailable && res.data.available) {
                onAvailable({ eventDate: date, startTime, endTime });
            }
        } catch (err) {
            setResult({ available: false, error: err.response?.data?.message || 'Error checking' });
        }
        setLoading(false);
    };

    return (
        <div className="bg-card rounded-xl p-5 border border-gray-100" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h3 className="font-bold text-text mb-4 flex items-center gap-2">
                <CalendarDays size={18} className="text-secondary" /> Check Availability
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div>
                    <label className="block text-xs font-medium text-muted mb-1">Event Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-muted mb-1">Start Time</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" />
                </div>
                <div>
                    <label className="block text-xs font-medium text-muted mb-1">End Time</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" />
                </div>
            </div>
            <button onClick={handleCheck} disabled={loading || !date || !startTime || !endTime}
                className="w-full bg-secondary text-white font-semibold py-2.5 rounded-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Checking...' : 'Check Availability'}
            </button>
            {result && (
                <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${result.available ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {result.available ? <CheckCircle size={18} className="mt-0.5 shrink-0" /> : <XCircle size={18} className="mt-0.5 shrink-0" />}
                    <div>
                        <p className="font-semibold text-sm">{result.available ? 'Available!' : 'Not Available'}</p>
                        {result.error && <p className="text-xs mt-1">{result.error}</p>}
                        {result.conflicts?.length > 0 && (
                            <div className="mt-2 text-xs space-y-1">
                                {result.conflicts.map((c, i) => (
                                    <p key={i} className="flex items-center gap-1">
                                        <AlertTriangle size={12} /> {c.bookingRef || c.reason}: {c.startTime}–{c.endTime} ({c.status || 'BLOCK'})
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
