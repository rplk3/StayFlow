import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, Users, XCircle, Edit, AlertTriangle } from 'lucide-react';
import { getBookingById, cancelBooking } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriceBreakdownCard from '../../components/PriceBreakdownCard';

export default function EventBookingDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [showCancel, setShowCancel] = useState(false);

    useEffect(() => {
        (async () => {
            try { const r = await getBookingById(id); setBooking(r.data.data); } catch (e) { console.error(e); }
            setLoading(false);
        })();
    }, [id]);

    const handleCancel = async () => {
        setCancelling(true);
        try {
            await cancelBooking(id);
            const r = await getBookingById(id);
            setBooking(r.data.data);
            setShowCancel(false);
        } catch (e) { alert(e.response?.data?.message || 'Cancel failed'); }
        setCancelling(false);
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div></div>;
    if (!booking) return <div className="text-center py-20"><p className="text-muted text-lg">Booking not found</p></div>;

    const canEdit = ['PENDING'].includes(booking.status);
    const canCancel = ['PENDING', 'APPROVED'].includes(booking.status);

    return (
        <div>
            <Link to="/my-event-bookings" className="inline-flex items-center gap-1.5 text-muted hover:text-secondary transition-colors mb-6 text-sm"><ArrowLeft size={16} /> Back to My Bookings</Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-text">{booking.bookingRef}</h1>
                        <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-muted text-sm">Submitted {new Date(booking.createdAt).toLocaleDateString()}</p>
                </div>
                {(canEdit || canCancel) && (
                    <div className="flex gap-2">
                        {canCancel && (
                            <button onClick={() => setShowCancel(true)} className="flex items-center gap-1.5 px-4 py-2 bg-danger text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                                <XCircle size={16} /> Cancel Booking
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {showCancel && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl p-6 max-w-md w-full" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <div className="flex items-center gap-2 mb-4 text-danger"><AlertTriangle size={24} /> <h3 className="text-lg font-bold">Cancel Booking</h3></div>
                        <p className="text-muted text-sm mb-6">Are you sure you want to cancel booking <strong>{booking.bookingRef}</strong>? This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowCancel(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-muted hover:border-secondary">Keep Booking</button>
                            <button onClick={handleCancel} disabled={cancelling} className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Event Details */}
                    <div className="bg-card rounded-xl p-6" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <h2 className="font-bold text-text mb-4">Event Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><span className="text-muted">Hall:</span> <strong>{booking.hallSnapshot?.name}</strong></div>
                            <div><span className="text-muted">Event Type:</span> <strong>{booking.eventType}</strong></div>
                            <div className="flex items-center gap-1"><CalendarDays size={14} className="text-muted" /> <span className="text-muted">Date:</span> <strong>{new Date(booking.eventDate).toLocaleDateString()}</strong></div>
                            <div className="flex items-center gap-1"><Clock size={14} className="text-muted" /> <span className="text-muted">Time:</span> <strong>{booking.startTime} – {booking.endTime} ({booking.durationHours}h)</strong></div>
                            <div className="flex items-center gap-1"><Users size={14} className="text-muted" /> <span className="text-muted">Guests:</span> <strong>{booking.guestsCount}</strong></div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="bg-card rounded-xl p-6" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <h2 className="font-bold text-text mb-4">Customer Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><span className="text-muted">Name:</span> <strong>{booking.customerName}</strong></div>
                            <div><span className="text-muted">Email:</span> <strong>{booking.customerEmail}</strong></div>
                            <div><span className="text-muted">Phone:</span> <strong>{booking.customerPhone}</strong></div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="bg-card rounded-xl p-6" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <h2 className="font-bold text-text mb-4">Services</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <span>Catering</span>
                                <span className={`font-semibold ${booking.services?.catering?.selected ? 'text-accent' : 'text-muted'}`}>
                                    {booking.services?.catering?.selected ? `✓ LKR ${booking.services.catering.pricePerPerson}/person – ${booking.services.catering.menu}` : 'Not selected'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <span>Decoration</span>
                                <span className={`font-semibold ${booking.services?.decoration?.selected ? 'text-accent' : 'text-muted'}`}>
                                    {booking.services?.decoration?.selected ? `✓ LKR ${booking.services.decoration.price?.toLocaleString()}` : 'Not selected'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <span>Audio/Visual</span>
                                <span className={`font-semibold ${booking.services?.audioVisual?.selected ? 'text-accent' : 'text-muted'}`}>
                                    {booking.services?.audioVisual?.selected ? `✓ LKR ${booking.services.audioVisual.price?.toLocaleString()}` : 'Not selected'}
                                </span>
                            </div>
                            {booking.services?.extraItems?.length > 0 && booking.services.extraItems.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                    <span>{item.name}</span>
                                    <span className="font-semibold text-accent">{item.qty}× LKR {item.unitPrice?.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        {booking.specialRequests && (
                            <div className="mt-4"><span className="text-muted text-sm">Special Requests:</span><p className="mt-1 bg-amber-50 p-3 rounded-lg text-sm">{booking.specialRequests}</p></div>
                        )}
                    </div>

                    {/* Admin Decision */}
                    {booking.adminDecision?.decidedAt && (
                        <div className={`rounded-xl p-6 ${booking.status === 'REJECTED' ? 'bg-red-50 border border-red-200' : booking.status === 'APPROVED' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                            <h2 className="font-bold mb-2">Admin Decision</h2>
                            <div className="text-sm space-y-1">
                                <p><span className="text-muted">Decided:</span> {new Date(booking.adminDecision.decidedAt).toLocaleDateString()}</p>
                                {booking.adminDecision.reason && <p><span className="text-muted">Reason:</span> <strong>{booking.adminDecision.reason}</strong></p>}
                                {booking.adminDecision.adminNotes && <p><span className="text-muted">Notes:</span> {booking.adminDecision.adminNotes}</p>}
                                {booking.adminDecision.finalTotal && <p><span className="text-muted">Final Total:</span> <strong className="text-accent">LKR {booking.adminDecision.finalTotal?.toLocaleString()}</strong></p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pricing Sidebar */}
                <div>
                    <PriceBreakdownCard pricing={booking.pricing} services={booking.services} guestsCount={booking.guestsCount} hallSnapshot={booking.hallSnapshot} />
                </div>
            </div>
        </div>
    );
}
