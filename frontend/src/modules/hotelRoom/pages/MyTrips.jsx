import React, { useState, useEffect } from 'react';
import { getMyTrips, cancelBooking } from '../services/bookingApi';
import { Calendar, MapPin, Users, RefreshCw, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
const PAYMENT_API = 'http://localhost:5000/api/payments';

const MyTrips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [payments, setPayments] = useState({});
    const userId = 'USER_123';

    useEffect(() => { fetchTrips(); }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const res = await getMyTrips(userId);
            setTrips(res.data);
            // fetch payment info
            for (const t of res.data) {
                try {
                    const pRes = await axios.get(`${PAYMENT_API}/booking/${t._id}`);
                    setPayments(prev => ({ ...prev, [t._id]: pRes.data }));
                } catch (e) { /* no payment */ }
            }
        } catch (err) {
            console.error("Failed to fetch trips", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        const result = await Swal.fire({
            title: 'Cancel Booking?',
            text: "Are you sure you want to cancel this booking?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Yes, cancel it!'
        });
        
        if (!result.isConfirmed) return;

        try {
            setCancellingId(id);
            await cancelBooking(id);
            await fetchTrips();
            Swal.fire('Cancelled!', 'Your booking has been cancelled.', 'success');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.error || "Cancellation failed", 'error');
        } finally {
            setCancellingId(null);
        }
    };

    const handleRefundRequest = async (tripId) => {
        const paymentInfo = payments[tripId];
        if (!paymentInfo?.payment) { 
            Swal.fire('No Payment', 'No payment record found for this booking.', 'info'); 
            return; 
        }

        const result = await Swal.fire({
            title: 'Request Refund?',
            text: "Note: You are only eligible for a refund if you cancelled the booking before the booking date. Do you want to proceed?",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#f97316',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, request refund'
        });

        if (!result.isConfirmed) return;

        try {
            await axios.post(`${PAYMENT_API}/${paymentInfo.payment._id}/refund`, {
                refundReason: 'Customer requested refund after cancellation'
            });
            Swal.fire('Submitted', 'Refund request submitted successfully.', 'success');
            fetchTrips();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Refund request failed', 'error');
        }
    };

    const statusConfig = {
        CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Upcoming' },
        CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
        HOLD: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
        NO_SHOW: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'No Show' },
        COMPLETED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' }
    };

    if (loading) return <div className="p-10 text-center flex items-center justify-center text-gray-600"><RefreshCw className="animate-spin mr-2" /> Loading your trips...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">My Trips</h1>
            <p className="text-gray-500 text-sm mb-6">View and manage your room bookings</p>

            {trips.length === 0 ? (
                <div className="bg-gray-50 p-10 rounded-xl text-center border border-gray-200">
                    <MapPin className="mx-auto text-gray-300 mb-3" size={40} />
                    <h2 className="text-lg text-gray-600 mb-1">No trips found</h2>
                    <p className="text-gray-400 text-sm">You haven't booked anything yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {trips.map(trip => {
                        const st = statusConfig[trip.status] || statusConfig.HOLD;
                        const paymentInfo = payments[trip._id];
                        const canCancel = ['CONFIRMED', 'HOLD'].includes(trip.status);
                        const canRefund = trip.status === 'CANCELLED' && paymentInfo?.payment?.paymentStatus === 'paid' && !paymentInfo?.refund;

                        return (
                            <div key={trip._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition">
                                <div className="flex">
                                    {/* Image */}
                                    <div className="w-64 flex-shrink-0 bg-gray-100 relative hidden md:block">
                                        {trip.hotelId?.images?.[0] ? (
                                            <img src={trip.hotelId.images[0]} alt="Hotel" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300"><MapPin size={36} /></div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{trip.hotelId?.name || 'Hotel'}</h3>
                                                {trip.hotelId?.location && (
                                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <MapPin size={13} /> {trip.hotelId.location}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-6 text-sm mb-3">
                                            <div>
                                                <p className="text-gray-400 text-xs">Check-in</p>
                                                <p className="font-semibold flex items-center gap-1"><Calendar size={13} /> {new Date(trip.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs">Check-out</p>
                                                <p className="font-semibold flex items-center gap-1"><Calendar size={13} /> {new Date(trip.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs">Guests</p>
                                                <p className="font-semibold flex items-center gap-1"><Users size={13} /> {trip.guests} guest{trip.guests > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>

                                        <div className="text-sm mb-3">
                                            <span className="text-gray-400 text-xs">Room Type</span>
                                            <p className="font-semibold">{trip.roomId?.roomType || 'Standard'}</p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-400">Booking Ref: <span className="font-mono font-semibold text-gray-600">{trip.bookingCode}</span></p>

                                            <div className="flex gap-2">
                                                {canCancel && (
                                                    <button
                                                        onClick={() => handleCancel(trip._id)}
                                                        disabled={cancellingId === trip._id}
                                                        className="px-4 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition"
                                                    >
                                                        {cancellingId === trip._id ? 'Cancelling...' : 'Cancel Booking'}
                                                    </button>
                                                )}
                                                {canRefund && (
                                                    <button
                                                        onClick={() => handleRefundRequest(trip._id)}
                                                        className="px-4 py-1.5 border border-orange-200 text-orange-600 rounded-lg text-xs font-semibold hover:bg-orange-50 transition"
                                                    >
                                                        Request Refund
                                                    </button>
                                                )}
                                                {paymentInfo?.refund && (
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        paymentInfo.refund.refundStatus === 'processed' ? 'bg-green-100 text-green-700' :
                                                        paymentInfo.refund.refundStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                        Refund {paymentInfo.refund.refundStatus}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyTrips;
