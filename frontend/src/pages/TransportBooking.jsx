import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, X } from 'lucide-react';
import BookingForm from '../components/transport/guest/BookingForm';

const C = {
    800: '#0F2D52', 700: '#0F2D52', 500: '#1D6FE8', 100: '#DBEAFE',
};

export default function TransportBooking() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { loadData, vehicles } = useAppStore();
    
    const [successBanner, setSuccessBanner] = useState(false);
    const [dismissedWarningIds, setDismissedWarningIds] = useState([]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const warnings = useMemo(() => {
        const nextWarnings = [];
        const availableVehicles = vehicles.filter((v) => v.status === 'Available');
        if (availableVehicles.length === 0 && vehicles.length > 0) {
            nextWarnings.push({
                id: 'no-available-vehicles',
                type: 'info',
                message: 'All vehicles are currently in use.',
                detail: 'You can still place a request and we will assign a car as soon as one is free.',
            });
        }
        if (vehicles.length === 0) {
            nextWarnings.push({
                id: 'no-vehicles',
                type: 'error',
                message: 'No vehicles available right now.',
                detail: 'Bookings may not be accepted until the fleet is configured.',
            });
        }
        return nextWarnings.filter((warning) => !dismissedWarningIds.includes(warning.id));
    }, [vehicles, dismissedWarningIds]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="text-white py-8 px-4" style={{ background: `linear-gradient(135deg, ${C[800]}, ${C[700]})` }}>
                <div className="max-w-6xl mx-auto">
                    <button onClick={() => navigate('/')} className="hover:text-white text-sm mb-3 flex items-center gap-1" style={{ color: C[100] }}>
                        <ArrowLeft size={14} /> Back to Home
                    </button>
                    <h1 className="text-4xl font-extrabold mb-2">Book a Ride</h1>
                    <p className="text-lg" style={{ color: C[100] }}>Reserve premium transportation for your journey</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {warnings.map((w) => (
                    <div
                        key={w.id}
                        className="mb-4 p-4 rounded-xl flex justify-between items-start"
                        style={{
                            background: w.type === 'error' ? '#fef2f2' : w.type === 'warning' ? '#fffbeb' : '#eff6ff',
                            border: `1px solid ${w.type === 'error' ? '#fecaca' : w.type === 'warning' ? '#fde68a' : '#bfdbfe'}`,
                            color: w.type === 'error' ? '#991b1b' : w.type === 'warning' ? '#92400e' : '#1e40af',
                        }}
                    >
                        <div>
                            <strong className="block mb-1">{w.message}</strong>
                            {w.detail && <span className="opacity-80 text-sm">{w.detail}</span>}
                        </div>
                        <button
                            onClick={() => setDismissedWarningIds((prev) => [...prev, w.id])}
                            className="opacity-70 hover:opacity-100"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}

                {successBanner && (
                    <div className="bg-green-50 text-green-800 p-4 rounded-xl mb-6 flex justify-between font-semibold border border-green-200">
                        ✅ Booking successfully submitted! View it in your account.
                        <button onClick={() => setSuccessBanner(false)} className="text-green-700 hover:text-green-900">
                            <X size={16} />
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <BookingForm
                        guestName={user?.firstName ? `${user.firstName} ${user.lastName}` : 'Guest'}
                        vehicles={vehicles}
                        onSuccess={() => {
                            setSuccessBanner(true);
                            void loadData();
                            setTimeout(() => setSuccessBanner(false), 5000);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
