import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clock, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getBookingById, approveBooking, rejectBooking, adminCancelBooking } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import PriceBreakdownCard from '../../components/PriceBreakdownCard';

export default function AdminEventBookingDetails() {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [action, setAction] = useState(null); // 'approve' | 'reject' | null
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [finalTotal, setFinalTotal] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const fetchBooking = async () => {
        try { const r = await getBookingById(id); setBooking(r.data.data); } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchBooking(); }, [id]);

    const handleApprove = async () => {
        setProcessing(true); setError('');
        try {
            const data = { adminId: 'admin1', adminNotes };
            if (finalTotal) data.finalTotal = Number(finalTotal);
            await approveBooking(id, data);
            await fetchBooking();
            setAction(null);
        } catch (e) { setError(e.response?.data?.message || 'Approve failed'); }
        setProcessing(false);
    };

    const handleReject = async () => {
        if (!rejectReason) { setError('Rejection reason is required'); return; }
        setProcessing(true); setError('');
        try {
            await rejectBooking(id, { adminId: 'admin1', reason: rejectReason, adminNotes });
            await fetchBooking();
            setAction(null);
        } catch (e) { setError(e.response?.data?.message || 'Reject failed'); }
        setProcessing(false);
    };

    const handleCancel = async () => {
        setProcessing(true);
        try {
            await adminCancelBooking(id, { adminId: 'admin1', reason: 'Cancelled by admin' });
            await fetchBooking();
        } catch (e) { alert(e.response?.data?.message || 'Cancel failed'); }
        setProcessing(false);
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div></div>;
    if (!booking) return <div className="text-center py-20"><p className="text-muted text-lg">Booking not found</p></div>;

    return (
        <div>
            <Link to="/admin/event-bookings" className="inline-flex items-center gap-1.5 text-muted hover:text-secondary transition-colors mb-6 text-sm"><ArrowLeft size={16} /> Back to Requests</Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold">{booking.bookingRef}</h1>
                        <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-muted text-sm">Submitted {new Date(booking.createdAt).toLocaleDateString()}</p>
                </div>
                {booking.status === 'PENDING' && (
                    <div className="flex gap-2">
                        <button onClick={() => { setAction('approve'); setError(''); }} className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
                            <CheckCircle size={16} /> Approve
                        </button>
                        <button onClick={() => { setAction('reject'); setError(''); }} className="flex items-center gap-1.5 px-4 py-2 bg-danger text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                            <XCircle size={16} /> Reject
                        </button>
                    </div>
                )}
                {booking.status === 'APPROVED' && (
                    <button onClick={handleCancel} disabled={processing} className="flex items-center gap-1.5 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50">Cancel Booking</button>
                )}
            </div>

            {/* Decision Modal */}
            {action && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl p-6 max-w-lg w-full" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            {action === 'approve' ? <><CheckCircle size={20} className="text-accent" /> Approve Booking</> : <><XCircle size={20} className="text-danger" /> Reject Booking</>}
                        </h3>
                        {error && <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm mb-4">{error}</div>}
                        <div className="space-y-4">
                            {action === 'reject' && (
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">Rejection Reason *</label>
                                    <textarea rows={2} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none" placeholder="Why is this booking being rejected?" />
                                </div>
                            )}
                            {action === 'approve' && (
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">Final Total (LKR) <span className="text-muted font-normal">— leave empty to use calculated</span></label>
                                    <input type="number" value={finalTotal} onChange={e => setFinalTotal(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" placeholder={booking.pricing?.total} />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Admin Notes</label>
                                <textarea rows={2} value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 resize-none" placeholder="Internal notes..." />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end mt-6">
                            <button onClick={() => setAction(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-muted">Cancel</button>
                            <button onClick={action === 'approve' ? handleApprove : handleReject} disabled={processing}
                                className={`px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 ${action === 'approve' ? 'bg-accent hover:bg-green-600' : 'bg-danger hover:bg-red-600'}`}>
                                {processing ? <><Loader2 size={14} className="inline animate-spin mr-1" /> Processing...</> : action === 'approve' ? 'Confirm Approve' : 'Confirm Reject'}
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
                            <div><span className="text-muted">Type:</span> <strong>{booking.eventType}</strong></div>
                            <div className="flex items-center gap-1"><CalendarDays size={14} className="text-muted" /> <span className="text-muted">Date:</span> <strong>{new Date(booking.eventDate).toLocaleDateString()}</strong></div>
                            <div className="flex items-center gap-1"><Clock size={14} className="text-muted" /> <span className="text-muted">Time:</span> <strong>{booking.startTime} – {booking.endTime} ({booking.durationHours}h)</strong></div>
                            <div className="flex items-center gap-1"><Users size={14} className="text-muted" /> <span className="text-muted">Guests:</span> <strong>{booking.guestsCount}</strong></div>
                        </div>
                    </div>

                    {/* Customer */}
                    <div className="bg-card rounded-xl p-6" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <h2 className="font-bold text-text mb-4">Customer</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div><span className="text-muted">Name:</span> <strong>{booking.customerName}</strong></div>
                            <div><span className="text-muted">Email:</span> <strong>{booking.customerEmail}</strong></div>
                            <div><span className="text-muted">Phone:</span> <strong>{booking.customerPhone}</strong></div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="bg-card rounded-xl p-6" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                        <h2 className="font-bold text-text mb-4">Services</h2>
                        <div className="space-y-2 text-sm">
                            {[
                                { label: 'Catering', sel: booking.services?.catering?.selected, detail: booking.services?.catering?.selected ? `${booking.guestsCount} × LKR ${booking.services.catering.pricePerPerson} — ${booking.services.catering.menu}` : '' },
                                { label: 'Decoration', sel: booking.services?.decoration?.selected, detail: booking.services?.decoration?.selected ? `LKR ${booking.services.decoration.price?.toLocaleString()} — ${booking.services.decoration.notes}` : '' },
                                { label: 'Audio/Visual', sel: booking.services?.audioVisual?.selected, detail: booking.services?.audioVisual?.selected ? `LKR ${booking.services.audioVisual.price?.toLocaleString()}` : '' },
                            ].map(s => (
                                <div key={s.label} className="flex justify-between p-3 rounded-lg bg-gray-50">
                                    <span>{s.label}</span>
                                    <span className={s.sel ? 'text-accent font-semibold' : 'text-muted'}>{s.sel ? `✓ ${s.detail}` : 'Not selected'}</span>
                                </div>
                            ))}
                            {booking.services?.extraItems?.map((item, i) => (
                                <div key={i} className="flex justify-between p-3 rounded-lg bg-gray-50">
                                    <span>{item.name}</span>
                                    <span className="text-accent font-semibold">{item.qty}× LKR {item.unitPrice?.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        {booking.specialRequests && <div className="mt-4"><span className="text-muted text-sm">Special Requests:</span><p className="mt-1 bg-amber-50 p-3 rounded-lg text-sm">{booking.specialRequests}</p></div>}
                    </div>

                    {/* Previous Decision */}
                    {booking.adminDecision?.decidedAt && (
                        <div className={`rounded-xl p-6 ${booking.status === 'REJECTED' ? 'bg-red-50 border border-red-200' : booking.status === 'APPROVED' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                            <h2 className="font-bold mb-2">Admin Decision</h2>
                            <div className="text-sm space-y-1">
                                <p><span className="text-muted">By:</span> {booking.adminDecision.decidedBy}</p>
                                <p><span className="text-muted">At:</span> {new Date(booking.adminDecision.decidedAt).toLocaleString()}</p>
                                {booking.adminDecision.reason && <p><span className="text-muted">Reason:</span> <strong>{booking.adminDecision.reason}</strong></p>}
                                {booking.adminDecision.adminNotes && <p><span className="text-muted">Notes:</span> {booking.adminDecision.adminNotes}</p>}
                                {booking.adminDecision.finalTotal && <p><span className="text-muted">Final Total:</span> <strong className="text-accent">LKR {booking.adminDecision.finalTotal?.toLocaleString()}</strong></p>}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <PriceBreakdownCard pricing={booking.pricing} services={booking.services} guestsCount={booking.guestsCount} hallSnapshot={booking.hallSnapshot} />
                </div>
            </div>
        </div>
    );
}
