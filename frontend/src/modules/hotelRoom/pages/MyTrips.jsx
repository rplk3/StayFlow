import React, { useState, useEffect } from 'react';
import { getMyTrips, cancelBooking, getUserTransports } from '../services/bookingApi';
import { Calendar, MapPin, CheckCircle, XCircle, AlertCircle, RefreshCw, AlertTriangle, Car, Clock, Navigation, ChevronDown, ChevronUp } from 'lucide-react';

const MyTrips = () => {
    const [trips, setTrips] = useState([]);
    const [transports, setTransports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);
    const [expandedTransport, setExpandedTransport] = useState(null);
    const userId = 'USER_123';

    useEffect(() => { fetchTrips(); fetchTransports(); }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const res = await getMyTrips(userId);
            setTrips(res.data);
        } catch (err) {
            console.error("Failed to fetch trips", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransports = async () => {
        try {
            const res = await getUserTransports(userId);
            setTransports(res.data);
        } catch (err) {
            console.error("Failed to fetch transports", err);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking? Cancellation policies will apply.")) return;
        try {
            setCancellingId(id);
            await cancelBooking(id);
            await fetchTrips();
        } catch (err) {
            alert(err.response?.data?.error || "Cancellation failed");
        } finally {
            setCancellingId(null);
        }
    };

    // Find transport for a booking
    const getTransportForBooking = (bookingId) => transports.find(t => t.bookingId?._id === bookingId || t.bookingId === bookingId);

    if (loading) return <div className="p-10 text-center flex items-center justify-center text-gray-600"><RefreshCw className="animate-spin mr-2"/> Loading your trips...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 mt-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Trips</h1>

            {trips.length === 0 ? (
                <div className="bg-white p-10 rounded-2xl text-center shadow-sm">
                    <MapPin className="mx-auto text-gray-300 mb-4" size={48}/>
                    <h2 className="text-xl text-gray-600 mb-2">No trips found</h2>
                    <p className="text-gray-400">You haven't booked anything yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {trips.map(trip => {
                        const transport = getTransportForBooking(trip._id);
                        return (
                            <div key={trip._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                    <div className="md:w-1/4 h-48 md:h-auto bg-gray-100 flex-shrink-0">
                                        {trip.hotelId?.images?.[0] ? 
                                            <img src={trip.hotelId.images[0]} alt="Hotel" className="w-full h-full object-cover" /> :
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><MapPin size={40}/></div>
                                        }
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 mb-1">{trip.hotelId?.name || 'Hotel Unavailable'}</h2>
                                                <p className="text-gray-500 font-medium text-sm flex items-center">
                                                    <Calendar size={14} className="mr-1"/> 
                                                    {new Date(trip.checkInDate).toLocaleDateString()} &mdash; {new Date(trip.checkOutDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <StatusBadge status={trip.status} />
                                                <p className="text-xs text-gray-400 mt-2 font-mono">#{trip.bookingCode}</p>
                                            </div>
                                        </div>

                                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div><p className="text-gray-500 mb-1">Guests</p><p className="font-semibold">{trip.guests}</p></div>
                                            <div><p className="text-gray-500 mb-1">Room</p><p className="font-semibold">{trip.roomId?.roomType || 'Standard'}</p></div>
                                            <div><p className="text-gray-500 mb-1">Rate Plan</p><p className="font-semibold">{trip.ratePlanId?.name || 'Standard'}</p></div>
                                            <div><p className="text-gray-500 mb-1">Total Paid / Due</p><p className="font-semibold text-blue-600">Rs. {Math.round(trip.pricing.totalAmount)}</p></div>
                                        </div>
                                        
                                        {trip.status === 'CANCELLED' && trip.cancellationDetails && (
                                            <div className="mt-4 bg-red-50 p-3 rounded-lg text-red-800 text-xs flex items-center">
                                                <AlertTriangle size={14} className="mr-2"/>
                                                Cancelled on {new Date(trip.cancellationDetails.cancelledAt).toLocaleDateString()}. 
                                                Penalty: Rs. {Math.round(trip.cancellationDetails.penaltyAmount)}. 
                                                Refund: Rs. {Math.round(trip.cancellationDetails.refundAmount)}.
                                            </div>
                                        )}
                                    </div>
                                    {trip.status === 'CONFIRMED' && (
                                        <div className="bg-gray-50 border-l border-gray-200 p-6 md:w-48 flex flex-col justify-center gap-3">
                                            <button disabled={cancellingId === trip._id} onClick={() => handleCancel(trip._id)} className="w-full bg-white border border-red-200 text-red-600 font-medium py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 transition">
                                                {cancellingId === trip._id ? 'Cancelling...' : 'Cancel Trip'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Transport Section */}
                                {transport && (
                                    <div className="border-t border-gray-100">
                                        <button 
                                            onClick={() => setExpandedTransport(expandedTransport === trip._id ? null : trip._id)}
                                            className="w-full flex items-center justify-between px-6 py-3 bg-indigo-50 hover:bg-indigo-100 transition text-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Car size={16} className="text-indigo-600" />
                                                <span className="font-semibold text-indigo-800">Transport Request</span>
                                                <TransportStatusBadge status={transport.status} />
                                            </div>
                                            {expandedTransport === trip._id ? <ChevronUp size={16} className="text-indigo-400" /> : <ChevronDown size={16} className="text-indigo-400" />}
                                        </button>
                                        
                                        {expandedTransport === trip._id && (
                                            <div className="px-6 py-4 bg-indigo-50/50 border-t border-indigo-100">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div className="flex items-start gap-2">
                                                        <Calendar size={14} className="text-gray-400 mt-0.5" />
                                                        <div>
                                                            <p className="text-gray-500 text-xs">Pickup Date & Time</p>
                                                            <p className="font-semibold">{new Date(transport.pickupDate).toLocaleDateString()} at {transport.pickupTime}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <Navigation size={14} className="text-green-500 mt-0.5" />
                                                        <div>
                                                            <p className="text-gray-500 text-xs">Pickup Location</p>
                                                            <p className="font-semibold text-xs">{transport.pickupAddress}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <MapPin size={14} className="text-red-500 mt-0.5" />
                                                        <div>
                                                            <p className="text-gray-500 text-xs">Drop-off</p>
                                                            <p className="font-semibold text-xs">{transport.dropoffAddress}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                                                    <div><p className="text-gray-500 text-xs">Vehicle</p><p className="font-semibold capitalize">{transport.vehicleType}</p></div>
                                                    <div><p className="text-gray-500 text-xs">Passengers</p><p className="font-semibold">{transport.passengerCount}</p></div>
                                                    <div><p className="text-gray-500 text-xs">Distance</p><p className="font-semibold">{transport.estimatedDistance} km</p></div>
                                                    <div><p className="text-gray-500 text-xs">Cost</p><p className="font-bold text-indigo-700">Rs. {transport.estimatedCost?.toLocaleString()}</p></div>
                                                </div>
                                                {transport.forwardedToCompany?.companyName && (
                                                    <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200 text-xs">
                                                        <span className="text-indigo-600 font-semibold">Assigned to:</span> {transport.forwardedToCompany.companyName}
                                                        {transport.forwardedToCompany.reference && <span className="text-gray-500 ml-2">Ref: {transport.forwardedToCompany.reference}</span>}
                                                    </div>
                                                )}
                                                {transport.rejectionReason && (
                                                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700">
                                                        <span className="font-semibold">Rejection reason:</span> {transport.rejectionReason}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const StatusBadge = ({ status }) => {
    switch(status) {
        case 'CONFIRMED': return <span className="px-3 py-1 bg-green-100 text-green-800 font-bold text-xs rounded-full flex items-center justify-end w-max ml-auto"><CheckCircle size={12} className="mr-1"/> Confirmed</span>;
        case 'CANCELLED': return <span className="px-3 py-1 bg-red-100 text-red-800 font-bold text-xs rounded-full flex items-center justify-end w-max ml-auto"><XCircle size={12} className="mr-1"/> Cancelled</span>;
        case 'HOLD': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 font-bold text-xs rounded-full flex items-center justify-end w-max ml-auto"><AlertCircle size={12} className="mr-1"/> Pending</span>;
        default: return <span className="px-3 py-1 bg-gray-100 text-gray-800 font-bold text-xs rounded-full">{status}</span>;
    }
};

const TransportStatusBadge = ({ status }) => {
    const configs = {
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
        confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
        rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
        'in-transit': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Transit' },
        completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Completed' },
        cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };
    const c = configs[status] || configs.pending;
    return <span className={`px-2 py-0.5 ${c.bg} ${c.text} font-bold text-[10px] rounded-full uppercase`}>{c.label}</span>;
};

export default MyTrips;
