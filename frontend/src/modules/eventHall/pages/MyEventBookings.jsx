import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, Users, MapPin, RefreshCw, PartyPopper } from 'lucide-react';

const API = 'http://localhost:5000/api/event-halls';
const PAYMENT_API = 'http://localhost:5000/api/payments';
const userId = 'USER_123';

const MyEventBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [payments, setPayments] = useState({});

    useEffect(() => { fetchBookings(); }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/bookings/user/${userId}`);
            setBookings(res.data);
            for (const b of res.data) {
                try {
                    const pRes = await axios.get(`${PAYMENT_API}/booking/${b._id}`);
                    setPayments(prev => ({ ...prev, [b._id]: pRes.data }));
                } catch (e) { /* no payment */ }
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            setCancellingId(id);
            await axios.post(`${API}/bookings/${id}/cancel`, { reason: 'User cancelled' });
            fetchBookings();
        } catch (err) { alert(err.response?.data?.message || 'Cancellation failed'); }
        finally { setCancellingId(null); }
    };

    const handleRefundRequest = async (bookingId) => {
        const paymentInfo = payments[bookingId];
        if (!paymentInfo?.payment) { alert('No payment record found for this booking.'); return; }

        const confirmed = window.confirm(
            "Note: You are only eligible for a refund if you cancelled the booking before the booking date.\n\nDo you want to proceed with the refund request?"
        );
        if (!confirmed) return;

        try {
            await axios.post(`${PAYMENT_API}/${paymentInfo.payment._id}/refund`, {
                refundReason: 'Customer requested refund after cancellation'
            });
            alert('Refund request submitted successfully.');
            fetchBookings();
        } catch (err) {
            alert(err.response?.data?.message || 'Refund request failed');
        }
    };

    const statusConfig = {
        HOLD: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'On Hold' },
        PENDING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pending' },
        APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
        REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
        CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Cancelled' },
        COMPLETED: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Completed' }
    };

    if (loading) return <div className="p-10 text-center flex items-center justify-center text-gray-600"><RefreshCw className="animate-spin mr-2" /> Loading event bookings...</div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">My Event Bookings</h1>
            <p className="text-gray-500 text-sm mb-6">View and manage your event hall bookings</p>

            {bookings.length === 0 ? (
                <div className="bg-gray-50 p-10 rounded-xl text-center border border-gray-200">
                    <PartyPopper className="mx-auto text-gray-300 mb-3" size={40} />
                    <h2 className="text-lg text-gray-600 mb-1">No event bookings yet</h2>
                    <p className="text-gray-400 text-sm">Book an event hall to get started.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(b => {
                        const st = statusConfig[b.status] || statusConfig.HOLD;
                        const paymentInfo = payments[b._id];
                        const canCancel = ['HOLD', 'PENDING', 'APPROVED'].includes(b.status);
                        const canRefund = b.status === 'CANCELLED' && paymentInfo?.payment?.paymentStatus === 'paid' && !paymentInfo?.refund;

                        return (
                            <div key={b._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition">
                                <div className="flex">
                                    {/* Image */}
                                    <div className="w-64 flex-shrink-0 bg-gradient-to-br from-purple-100 to-indigo-100 relative hidden md:block">
                                        {b.hallId?.images?.[0] ? (
                                            <img src={b.hallId.images[0]} alt="Hall" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-purple-300"><PartyPopper size={36} /></div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{b.hallId?.name || 'Hall'}</h3>
                                                {b.hallId?.location && (
                                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <MapPin size={13} /> {b.hallId.location}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>{st.label}</span>
                                        </div>

                                        <div className="flex flex-wrap gap-6 text-sm mb-3">
                                            <div>
                                                <p className="text-gray-400 text-xs">Event Date</p>
                                                <p className="font-semibold flex items-center gap-1"><Calendar size={13} /> {new Date(b.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs">Time</p>
                                                <p className="font-semibold flex items-center gap-1"><Clock size={13} /> {b.startTime} – {b.endTime}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs">Guests</p>
                                                <p className="font-semibold flex items-center gap-1"><Users size={13} /> {b.guestCount} guest{b.guestCount > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>

                                        <div className="text-sm mb-3">
                                            <span className="text-gray-400 text-xs">Event Type</span>
                                            <p className="font-semibold">{b.eventType}</p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-400">Booking Ref: <span className="font-mono font-semibold text-gray-600">{b.bookingCode}</span></p>

                                            <div className="flex gap-2">
                                                {canCancel && (
                                                    <button
                                                        onClick={() => handleCancel(b._id)}
                                                        disabled={cancellingId === b._id}
                                                        className="px-4 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 disabled:opacity-50 transition"
                                                    >
                                                        {cancellingId === b._id ? 'Cancelling...' : 'Cancel Booking'}
                                                    </button>
                                                )}
                                                {canRefund && (
                                                    <button
                                                        onClick={() => handleRefundRequest(b._id)}
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

export default MyEventBookings;
