import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Clock, Calendar, MapPin, Star, CheckCircle, XCircle, AlertCircle, ArrowRight, ArrowLeft, CreditCard, Shield, Lock, Sparkles, X, ChevronDown, RefreshCw, PartyPopper } from 'lucide-react';

const API = 'http://localhost:5000/api/event-halls';
const userId = 'USER_123';

const eventTypes = ['Wedding', 'Conference', 'Birthday', 'Corporate', 'Seminar', 'Exhibition', 'Other'];

const EventHalls = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('browse'); // browse | checkout | myBookings
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedHall, setSelectedHall] = useState(null);

    // Checkout flow states
    const [checkoutStep, setCheckoutStep] = useState(0); // 0=none, 1=details, 2=payment, 3=success
    const [bookingForm, setBookingForm] = useState({ eventType: '', eventDate: '', startTime: '09:00', endTime: '17:00', guestCount: 50, specialNotes: '' });
    const [guestDetails, setGuestDetails] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [quote, setQuote] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [holdId, setHoldId] = useState(null);
    const [bookingCode, setBookingCode] = useState(null);
    const [error, setError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // My Bookings
    const [myBookings, setMyBookings] = useState([]);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => { fetchHalls(); }, []);

    const fetchHalls = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchText) params.search = searchText;
            const res = await axios.get(API, { params });
            setHalls(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchMyBookings = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/bookings/user/${userId}`);
            setMyBookings(res.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSearch = (e) => { e.preventDefault(); fetchHalls(); };

    // Open booking for a hall
    const startBooking = (hall) => {
        setSelectedHall(hall);
        setCheckoutStep(1);
        setTab('checkout');
        setQuote(null);
        setAvailability(null);
        setError('');
        setBookingForm({ eventType: '', eventDate: '', startTime: '09:00', endTime: '17:00', guestCount: 50, specialNotes: '' });
        setGuestDetails({ firstName: '', lastName: '', email: '', phone: '' });
    };

    // Check availability + get quote
    const checkAndQuote = async () => {
        if (!bookingForm.eventDate || !bookingForm.startTime || !bookingForm.endTime) return;
        try {
            const [availRes, quoteRes] = await Promise.all([
                axios.post(`${API}/check-availability`, { hallId: selectedHall._id, eventDate: bookingForm.eventDate, startTime: bookingForm.startTime, endTime: bookingForm.endTime }),
                axios.post(`${API}/quote`, { hallId: selectedHall._id, startTime: bookingForm.startTime, endTime: bookingForm.endTime })
            ]);
            setAvailability(availRes.data);
            setQuote(quoteRes.data);
        } catch (err) { setError('Failed to check availability'); }
    };

    useEffect(() => {
        if (selectedHall && bookingForm.eventDate && bookingForm.startTime && bookingForm.endTime) {
            checkAndQuote();
        }
    }, [bookingForm.eventDate, bookingForm.startTime, bookingForm.endTime]);

    // Step 1 → 2: create hold
    const handleContinueToPayment = async () => {
        if (!availability?.available) { setError('This time slot is not available'); return; }
        if (!bookingForm.eventType || !guestDetails.firstName || !guestDetails.email) { setError('Please fill in all required fields'); return; }
        try {
            setFormLoading(true);
            setError('');
            const res = await axios.post(`${API}/bookings/hold`, {
                hallId: selectedHall._id, userId, guestDetails,
                eventType: bookingForm.eventType, eventDate: bookingForm.eventDate,
                startTime: bookingForm.startTime, endTime: bookingForm.endTime,
                guestCount: bookingForm.guestCount, specialNotes: bookingForm.specialNotes,
                pricing: quote
            });
            setHoldId(res.data._id);
            setCheckoutStep(2);
        } catch (err) { setError(err.response?.data?.message || 'Failed to hold slot'); }
        finally { setFormLoading(false); }
    };

    // Step 2 → 3: confirm payment
    const handleConfirmPayment = async () => {
        try {
            setFormLoading(true);
            const res = await axios.post(`${API}/bookings/${holdId}/checkout`, { paymentToken: 'tok_mock123' });
            setBookingCode(res.data.booking.bookingCode);
            setCheckoutStep(3);
        } catch (err) { setError(err.response?.data?.message || 'Payment failed'); }
        finally { setFormLoading(false); }
    };

    const handleCancelBooking = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        try {
            setCancellingId(id);
            await axios.post(`${API}/bookings/${id}/cancel`, { reason: 'User cancelled' });
            fetchMyBookings();
        } catch (err) { alert(err.response?.data?.message || 'Cancellation failed'); }
        finally { setCancellingId(null); }
    };

    const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-gray-50";

    const statusBadge = (status) => {
        const c = { HOLD: 'bg-yellow-100 text-yellow-700', PENDING: 'bg-blue-100 text-blue-700', APPROVED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700', CANCELLED: 'bg-gray-100 text-gray-600', COMPLETED: 'bg-purple-100 text-purple-700' };
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${c[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    // ========= RENDER =========

    // Step indicator for checkout
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-0 mb-10">
            {[{ n: 1, l: 'Event Details' }, { n: 2, l: 'Payment' }, { n: 3, l: 'Confirmation' }].map((s, i) => (
                <React.Fragment key={s.n}>
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${checkoutStep >= s.n ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200' : 'bg-gray-200 text-gray-500'}`}>
                            {checkoutStep > s.n ? <CheckCircle size={18} /> : s.n}
                        </div>
                        <span className={`text-xs mt-2 font-medium whitespace-nowrap ${checkoutStep >= s.n ? 'text-purple-700' : 'text-gray-400'}`}>{s.l}</span>
                    </div>
                    {i < 2 && <div className={`w-16 md:w-24 h-0.5 mx-2 mt-[-16px] rounded-full transition-all ${checkoutStep > s.n ? 'bg-purple-500' : 'bg-gray-200'}`} />}
                </React.Fragment>
            ))}
        </div>
    );

    // SUCCESS
    if (tab === 'checkout' && checkoutStep === 3) {
        return (
            <div className="max-w-2xl mx-auto p-6 md:p-12 mt-8">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500"></div>
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                        <CheckCircle size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Event Booking Submitted!</h1>
                    <p className="text-gray-500 mb-2">Your booking is pending admin approval</p>
                    <div className="bg-purple-50 rounded-2xl p-6 mb-6 border border-purple-100">
                        <p className="text-sm text-purple-600 font-medium mb-1">Booking Code</p>
                        <p className="text-3xl font-extrabold text-purple-700 tracking-wider">{bookingCode}</p>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <button onClick={() => { setTab('myBookings'); fetchMyBookings(); setCheckoutStep(0); }} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-200">View My Bookings</button>
                        <button onClick={() => { setTab('browse'); setCheckoutStep(0); }} className="border-2 border-gray-200 text-gray-600 px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition">Browse Halls</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <button onClick={() => navigate('/')} className="text-purple-200 hover:text-white text-sm mb-3 flex items-center gap-1"><ArrowLeft size={14} /> Back to Home</button>
                    <h1 className="text-4xl font-extrabold mb-2">🎉 Event Halls</h1>
                    <p className="text-purple-200 text-lg">Find and book the perfect venue for your special occasion</p>
                    <div className="flex gap-2 mt-6">
                        {['browse', 'myBookings'].map(t => (
                            <button key={t} onClick={() => { setTab(t); if (t === 'myBookings') fetchMyBookings(); setCheckoutStep(0); }}
                                className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition ${tab === t || (tab === 'checkout' && t === 'browse') ? 'bg-white text-purple-700' : 'bg-purple-600 text-white hover:bg-purple-500'}`}>
                                {t === 'browse' ? '🏛️ Browse Halls' : '📋 My Bookings'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* ===== BROWSE TAB ===== */}
                {tab === 'browse' && (
                    <>
                        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" placeholder="Search halls by name..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                            </div>
                            <button type="submit" className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition">Search</button>
                        </form>

                        {loading ? (
                            <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin w-8 h-8 text-purple-500" /></div>
                        ) : halls.length === 0 ? (
                            <div className="text-center py-16"><PartyPopper className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl text-gray-500">No event halls available</h3></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {halls.map(hall => (
                                    <div key={hall._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                                        <div className="h-48 bg-gradient-to-br from-purple-200 to-indigo-200 relative overflow-hidden">
                                            {hall.images?.[0] ? (
                                                <img src={hall.images[0]} alt={hall.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-purple-400"><PartyPopper size={48} /></div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-bold text-purple-700 shadow">Rs. {hall.pricePerHour?.toLocaleString()}/hr</div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{hall.name}</h3>
                                            {hall.location && <p className="text-sm text-gray-500 flex items-center gap-1 mb-3"><MapPin size={14} /> {hall.location}</p>}
                                            <div className="flex gap-4 text-xs text-gray-500 mb-3">
                                                <span className="flex items-center gap-1"><Users size={14} /> {hall.capacity?.min}–{hall.capacity?.max} guests</span>
                                                {hall.pricePerDay && <span className="flex items-center gap-1"><Clock size={14} /> Rs. {hall.pricePerDay?.toLocaleString()}/day</span>}
                                            </div>
                                            {hall.facilities?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {hall.facilities.slice(0, 4).map((f, i) => <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded-full">{f}</span>)}
                                                    {hall.facilities.length > 4 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full">+{hall.facilities.length - 4}</span>}
                                                </div>
                                            )}
                                            <button onClick={() => startBooking(hall)} className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-purple-700 hover:to-indigo-700 transition-all shadow-sm">Book Now</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* ===== CHECKOUT TAB ===== */}
                {tab === 'checkout' && checkoutStep > 0 && checkoutStep < 3 && selectedHall && (
                    <>
                        <StepIndicator />
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left: Form */}
                            <div className="lg:w-[62%] space-y-6">
                                {error && <div className="bg-red-50 text-red-700 p-4 border border-red-200 rounded-xl flex items-center gap-2 text-sm font-medium"><AlertCircle size={18} /> {error}</div>}

                                {checkoutStep === 1 && (
                                    <>
                                        {/* Event Details */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                                                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Calendar size={20} /> Event Details</h2>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Type *</label>
                                                        <select value={bookingForm.eventType} onChange={e => setBookingForm({ ...bookingForm, eventType: e.target.value })} className={inputClass}>
                                                            <option value="">Select Type</option>
                                                            {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Date *</label>
                                                        <input type="date" value={bookingForm.eventDate} onChange={e => setBookingForm({ ...bookingForm, eventDate: e.target.value })} className={inputClass} min={new Date().toISOString().split('T')[0]} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Time *</label>
                                                        <input type="time" value={bookingForm.startTime} onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })} className={inputClass} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Time *</label>
                                                        <input type="time" value={bookingForm.endTime} onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })} className={inputClass} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Guests *</label>
                                                        <input type="number" value={bookingForm.guestCount} onChange={e => setBookingForm({ ...bookingForm, guestCount: parseInt(e.target.value) })} className={inputClass} min={1} max={selectedHall.capacity?.max} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Notes <span className="font-normal text-gray-400">(optional)</span></label>
                                                    <textarea value={bookingForm.specialNotes} onChange={e => setBookingForm({ ...bookingForm, specialNotes: e.target.value })} className={`${inputClass} h-20 resize-none`} placeholder="Any special requirements..." />
                                                </div>

                                                {/* Availability indicator */}
                                                {availability && (
                                                    <div className={`p-4 rounded-xl border flex items-center gap-2 text-sm font-medium ${availability.available ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                                        {availability.available ? <><CheckCircle size={18} /> This slot is available!</> : <><XCircle size={18} /> This slot is taken. Choose a different date or time.</>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Booking Person Details */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                                                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Users size={20} /> Booking Person Details</h2>
                                            </div>
                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name *</label><input type="text" className={inputClass} placeholder="John" value={guestDetails.firstName} onChange={e => setGuestDetails({ ...guestDetails, firstName: e.target.value })} /></div>
                                                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name *</label><input type="text" className={inputClass} placeholder="Doe" value={guestDetails.lastName} onChange={e => setGuestDetails({ ...guestDetails, lastName: e.target.value })} /></div>
                                                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label><input type="email" className={inputClass} placeholder="john@example.com" value={guestDetails.email} onChange={e => setGuestDetails({ ...guestDetails, email: e.target.value })} /></div>
                                                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone *</label><input type="tel" className={inputClass} placeholder="+94 77 123 4567" value={guestDetails.phone} onChange={e => setGuestDetails({ ...guestDetails, phone: e.target.value })} /></div>
                                            </div>
                                        </div>

                                        <button onClick={handleContinueToPayment} disabled={!availability?.available || !quote || formLoading}
                                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-200">
                                            {formLoading ? 'Processing...' : 'Continue to Payment'} <ArrowRight size={20} />
                                        </button>
                                    </>
                                )}

                                {checkoutStep === 2 && (
                                    <>
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
                                                <h2 className="text-lg font-bold text-white flex items-center gap-2"><CreditCard size={20} /> Payment Information</h2>
                                            </div>
                                            <div className="p-6 space-y-5">
                                                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-100">
                                                    <div className="flex items-center justify-between">
                                                        <div><p className="text-sm text-purple-600 font-medium">Total Amount</p></div>
                                                        <p className="text-3xl font-extrabold text-purple-700">Rs. {quote?.totalAmount?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Card Number</label><input type="text" placeholder="4111 1111 1111 1111" className={inputClass} /></div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry</label><input type="text" placeholder="MM / YY" className={inputClass} /></div>
                                                    <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">CVC</label><input type="text" placeholder="123" className={inputClass} /></div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400"><Lock size={14} /> Your payment information is encrypted and secure</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => setCheckoutStep(1)} className="flex items-center gap-2 px-6 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"><ArrowLeft size={18} /> Back</button>
                                            <button onClick={handleConfirmPayment} disabled={formLoading}
                                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-200">
                                                <Shield size={20} /> {formLoading ? 'Processing...' : 'Pay & Submit Booking'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Right: Summary */}
                            <div className="lg:w-[38%]">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-6 overflow-hidden">
                                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                                        <h3 className="font-bold text-lg text-white flex items-center gap-2"><Sparkles size={18} className="text-yellow-400" /> Booking Summary</h3>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="font-bold text-gray-900 mb-1">{selectedHall.name}</h4>
                                        {selectedHall.location && <p className="text-sm text-gray-500 flex items-center gap-1 mb-4"><MapPin size={14} /> {selectedHall.location}</p>}
                                        <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
                                            {bookingForm.eventType && <div className="flex justify-between"><span className="text-gray-500">Event</span><span className="font-semibold">{bookingForm.eventType}</span></div>}
                                            {bookingForm.eventDate && <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold">{bookingForm.eventDate}</span></div>}
                                            <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-semibold">{bookingForm.startTime} – {bookingForm.endTime}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="font-semibold">{bookingForm.guestCount}</span></div>
                                        </div>
                                        {quote && (
                                            <div className="space-y-2 text-sm mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex justify-between"><span className="text-gray-500">Hall Charge ({quote.durationHours}h)</span><span className="font-semibold">Rs. {quote.hallCharge?.toLocaleString()}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Taxes & Fees</span><span className="font-semibold">Rs. {quote.taxesFees?.toLocaleString()}</span></div>
                                                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                                                    <span className="text-base font-bold text-gray-900">Total</span>
                                                    <span className="text-2xl font-extrabold text-purple-700">Rs. {quote.totalAmount?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* ===== MY BOOKINGS TAB ===== */}
                {tab === 'myBookings' && (
                    <>
                        {loading ? (
                            <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin w-8 h-8 text-purple-500" /></div>
                        ) : myBookings.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl"><PartyPopper className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl text-gray-500 mb-2">No event bookings yet</h3></div>
                        ) : (
                            <div className="space-y-4">
                                {myBookings.map(b => (
                                    <div key={b._id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-gray-900">{b.hallId?.name || 'Hall'}</h3>
                                                    {statusBadge(b.status)}
                                                </div>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(b.eventDate).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><Clock size={14} /> {b.startTime} – {b.endTime}</span>
                                                    <span className="flex items-center gap-1"><Users size={14} /> {b.guestCount} guests</span>
                                                    <span className="font-semibold text-purple-700">Rs. {b.pricing?.totalAmount?.toLocaleString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1 font-mono">#{b.bookingCode} • {b.eventType}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {['HOLD', 'PENDING', 'APPROVED'].includes(b.status) && (
                                                    <button onClick={() => handleCancelBooking(b._id)} disabled={cancellingId === b._id}
                                                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 disabled:opacity-50 transition">
                                                        {cancellingId === b._id ? 'Cancelling...' : 'Cancel'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {b.rejectedReason && <div className="mt-3 p-3 bg-red-50 rounded-lg text-red-700 text-xs"><span className="font-semibold">Rejected:</span> {b.rejectedReason}</div>}
                                        {b.confirmationNote && <div className="mt-3 p-3 bg-green-50 rounded-lg text-green-700 text-xs"><span className="font-semibold">Confirmation:</span> {b.confirmationNote}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EventHalls;
