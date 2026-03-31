import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Clock, Calendar, MapPin, CheckCircle, XCircle, AlertCircle, ArrowRight, ArrowLeft, RefreshCw, PartyPopper, ChevronDown, Lock, Download, Mail, UserPlus, Tag } from 'lucide-react';
import PaymentGateway from '../modules/payment/components/PaymentGateway';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import jsPDF from 'jspdf';

const API = 'http://localhost:5000/api/event-halls';
const userId = 'USER_123';

/* ───────── Color palette (matching LandingPage) ───────── */
const C = {
    900: '#012A4A', 800: '#013A63', 700: '#01497C', 600: '#014F86',
    500: '#2A6F97', 400: '#2C7DA0', 300: '#468FAF', 200: '#61A5C2',
    100: '#89C2D9', 50: '#A9D6E5',
};

const eventTypes = ['Wedding', 'Conference', 'Birthday', 'Corporate', 'Seminar', 'Exhibition', 'Other'];

/* ───────── Country data for phone picker ───────── */
const countries = [
    { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: 'https://flagcdn.com/w40/lk.png', phoneLengths: [9] },
    { code: 'IN', name: 'India', dial: '+91', flag: 'https://flagcdn.com/w40/in.png', phoneLengths: [10] },
    { code: 'US', name: 'United States', dial: '+1', flag: 'https://flagcdn.com/w40/us.png', phoneLengths: [10] },
    { code: 'GB', name: 'United Kingdom', dial: '+44', flag: 'https://flagcdn.com/w40/gb.png', phoneLengths: [10, 11] },
    { code: 'AU', name: 'Australia', dial: '+61', flag: 'https://flagcdn.com/w40/au.png', phoneLengths: [9] },
    { code: 'AE', name: 'UAE', dial: '+971', flag: 'https://flagcdn.com/w40/ae.png', phoneLengths: [9] },
    { code: 'SG', name: 'Singapore', dial: '+65', flag: 'https://flagcdn.com/w40/sg.png', phoneLengths: [8] },
    { code: 'MY', name: 'Malaysia', dial: '+60', flag: 'https://flagcdn.com/w40/my.png', phoneLengths: [9, 10] },
    { code: 'JP', name: 'Japan', dial: '+81', flag: 'https://flagcdn.com/w40/jp.png', phoneLengths: [10, 11] },
    { code: 'DE', name: 'Germany', dial: '+49', flag: 'https://flagcdn.com/w40/de.png', phoneLengths: [10, 11] },
    { code: 'FR', name: 'France', dial: '+33', flag: 'https://flagcdn.com/w40/fr.png', phoneLengths: [9] },
    { code: 'CA', name: 'Canada', dial: '+1', flag: 'https://flagcdn.com/w40/ca.png', phoneLengths: [10] },
    { code: 'NZ', name: 'New Zealand', dial: '+64', flag: 'https://flagcdn.com/w40/nz.png', phoneLengths: [8, 9] },
    { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: 'https://flagcdn.com/w40/sa.png', phoneLengths: [9] },
    { code: 'CN', name: 'China', dial: '+86', flag: 'https://flagcdn.com/w40/cn.png', phoneLengths: [11] },
];

const EventHalls = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState('browse');
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedHall, setSelectedHall] = useState(null);

    // Checkout flow states
    const [checkoutStep, setCheckoutStep] = useState(0);
    const [bookingForm, setBookingForm] = useState({ eventType: '', eventDate: null, startTime: '09:00', endTime: '17:00', guestCount: 50, specialNotes: '' });
    const [guestDetails, setGuestDetails] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [quote, setQuote] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [holdId, setHoldId] = useState(null);
    const [bookingCode, setBookingCode] = useState(null);
    const [error, setError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Validation state
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const countryPickerRef = useRef(null);

    useEffect(() => { fetchHalls(); }, []);

    // Close country picker on outside click
    useEffect(() => {
        const handler = (e) => {
            if (countryPickerRef.current && !countryPickerRef.current.contains(e.target)) {
                setShowCountryPicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Email validation
    const validateEmail = (email) => {
        if (!email) { setEmailError(''); return true; }
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) { setEmailError('Enter a valid email address'); return false; }
        setEmailError('');
        return true;
    };

    // Phone validation
    const validatePhone = (phone) => {
        if (!phone) { setPhoneError(''); return true; }
        const digits = phone.replace(/\D/g, '');
        if (!selectedCountry.phoneLengths.includes(digits.length)) {
            setPhoneError(`Enter a valid phone number (${selectedCountry.phoneLengths.join(' or ')} digits for ${selectedCountry.name})`);
            return false;
        }
        setPhoneError('');
        return true;
    };

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

    const handleSearch = (e) => { e.preventDefault(); fetchHalls(); };

    const startBooking = (hall) => {
        setSelectedHall(hall);
        setCheckoutStep(1);
        setTab('checkout');
        setQuote(null);
        setAvailability(null);
        setError('');
        setEmailError('');
        setPhoneError('');
        setBookingForm({ eventType: '', eventDate: null, startTime: '09:00', endTime: '17:00', guestCount: 50, specialNotes: '' });
        setGuestDetails({ firstName: '', lastName: '', email: '', phone: '' });
    };

    // Format date for API
    const formatDateForApi = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    };

    const checkAndQuote = async () => {
        const eventDateStr = formatDateForApi(bookingForm.eventDate);
        if (!eventDateStr || !bookingForm.startTime || !bookingForm.endTime) return;
        try {
            const [availRes, quoteRes] = await Promise.all([
                axios.post(`${API}/check-availability`, { hallId: selectedHall._id, eventDate: eventDateStr, startTime: bookingForm.startTime, endTime: bookingForm.endTime }),
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

    const handleContinueToPayment = async () => {
        if (!availability?.available) { setError('This time slot is not available'); return; }
        if (!bookingForm.eventType || !guestDetails.firstName || !guestDetails.email) { setError('Please fill in all required fields'); return; }

        const isEmailValid = validateEmail(guestDetails.email);
        const isPhoneValid = validatePhone(guestDetails.phone);
        if (!isEmailValid || !isPhoneValid) return;

        try {
            setFormLoading(true);
            setError('');
            const res = await axios.post(`${API}/bookings/hold`, {
                hallId: selectedHall._id, userId,
                guestDetails: { ...guestDetails, phone: `${selectedCountry.dial} ${guestDetails.phone}` },
                eventType: bookingForm.eventType, eventDate: formatDateForApi(bookingForm.eventDate),
                startTime: bookingForm.startTime, endTime: bookingForm.endTime,
                guestCount: bookingForm.guestCount, specialNotes: bookingForm.specialNotes,
                pricing: quote
            });
            setHoldId(res.data._id);
            setCheckoutStep(2);
        } catch (err) { setError(err.response?.data?.message || 'Failed to hold slot'); }
        finally { setFormLoading(false); }
    };

    const handlePaymentSuccess = async (paymentResult) => {
        try {
            const res = await axios.post(`${API}/bookings/${holdId}/checkout`, { paymentToken: 'tok_mock123' });
            setBookingCode(res.data.booking.bookingCode);
            setCheckoutStep(3);
        } catch (err) { setError(err.response?.data?.message || 'Booking confirmation failed'); }
    };

    // ── Generate Invoice PDF ──
    const generateInvoicePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFillColor(1, 42, 74);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setFillColor(1, 73, 124);
        doc.rect(0, 40, pageWidth, 4, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('StayFlow', 20, 25);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Event Hall Booking Confirmation', 20, 33);

        doc.setFontSize(9);
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 20, 25, { align: 'right' });
        doc.text(`Booking Code: ${bookingCode || 'N/A'}`, pageWidth - 20, 33, { align: 'right' });

        let y = 58;
        doc.setTextColor(1, 42, 74);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Booking Person', 20, y); y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Name: ${guestDetails.firstName} ${guestDetails.lastName}`, 20, y); y += 6;
        doc.text(`Email: ${guestDetails.email}`, 20, y); y += 6;
        doc.text(`Phone: ${selectedCountry.dial} ${guestDetails.phone}`, 20, y); y += 12;

        doc.setTextColor(1, 42, 74);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Event Details', 20, y); y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Venue: ${selectedHall?.name || 'N/A'}`, 20, y); y += 6;
        if (selectedHall?.location) { doc.text(`Location: ${selectedHall.location}`, 20, y); y += 6; }
        doc.text(`Event Type: ${bookingForm.eventType}`, 20, y); y += 6;
        doc.text(`Event Date: ${formatDateForApi(bookingForm.eventDate)}`, 20, y); y += 6;
        doc.text(`Time: ${bookingForm.startTime} – ${bookingForm.endTime}`, 20, y); y += 6;
        doc.text(`Guests: ${bookingForm.guestCount}`, 20, y); y += 12;

        doc.setTextColor(1, 42, 74);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Summary', 20, y); y += 10;

        doc.setFillColor(1, 73, 124);
        doc.rect(20, y - 5, pageWidth - 40, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Description', 25, y + 1);
        doc.text('Amount (Rs.)', pageWidth - 25, y + 1, { align: 'right' }); y += 12;

        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        const rows = [];
        if (quote?.hallCharge) rows.push([`Hall Charge (${quote.durationHours}h)`, quote.hallCharge.toLocaleString()]);
        if (quote?.taxesFees > 0) rows.push(['Taxes & Fees', quote.taxesFees.toLocaleString()]);

        rows.forEach(([label, val], i) => {
            if (i % 2 === 0) { doc.setFillColor(245, 247, 250); doc.rect(20, y - 5, pageWidth - 40, 9, 'F'); }
            doc.text(label, 25, y);
            doc.text(val, pageWidth - 25, y, { align: 'right' }); y += 9;
        });

        doc.setFillColor(1, 42, 74);
        doc.rect(20, y - 3, pageWidth - 40, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Total Paid', 25, y + 5);
        doc.text(`Rs. ${(quote?.totalAmount || 0).toLocaleString()}`, pageWidth - 25, y + 5, { align: 'right' });

        const footerY = doc.internal.pageSize.getHeight() - 20;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('StayFlow | www.stayflow.com | support@stayflow.com', pageWidth / 2, footerY, { align: 'center' });
        doc.text('Thank you for choosing StayFlow!', pageWidth / 2, footerY + 5, { align: 'center' });

        doc.save(`StayFlow_Event_${bookingCode || 'receipt'}.pdf`);
    };

    const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none text-sm bg-gray-50 transition-all";

    // Step indicator for checkout
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-0 mb-10">
            {[{ n: 1, l: 'Event Details' }, { n: 2, l: 'Payment' }, { n: 3, l: 'Confirmation' }].map((s, i) => (
                <React.Fragment key={s.n}>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${checkoutStep >= s.n ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}
                            style={checkoutStep >= s.n ? { background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`, boxShadow: `0 4px 14px ${C[500]}44` } : {}}
                        >
                            {checkoutStep > s.n ? <CheckCircle size={18} /> : s.n}
                        </div>
                        <span
                            className={`text-xs mt-2 font-medium whitespace-nowrap ${checkoutStep >= s.n ? 'font-semibold' : 'text-gray-400'}`}
                            style={checkoutStep >= s.n ? { color: C[700] } : {}}
                        >
                            {s.l}
                        </span>
                    </div>
                    {i < 2 && (
                        <div
                            className="w-16 md:w-24 h-0.5 mx-2 mt-[-16px] rounded-full transition-all duration-500"
                            style={{ background: checkoutStep > s.n ? C[500] : '#e5e7eb' }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    // SUCCESS
    if (tab === 'checkout' && checkoutStep === 3) {
        return (
            <div className="max-w-2xl mx-auto p-6 md:p-12 mt-8">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2" style={{ background: `linear-gradient(90deg, ${C[500]}, ${C[300]}, ${C[100]})` }}></div>
                    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30" style={{ background: C[50] }}></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-30" style={{ background: C[100] }}></div>

                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" style={{ background: `linear-gradient(135deg, ${C[500]}, ${C[700]})`, boxShadow: `0 8px 24px ${C[500]}44` }}>
                            <CheckCircle size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Event Booking Submitted!</h1>
                        <p className="text-gray-500 mb-4">Your booking is pending admin approval</p>

                        <div className="rounded-2xl p-6 mb-5 border" style={{ background: `${C[50]}33`, borderColor: `${C[100]}66` }}>
                            <p className="text-sm font-medium mb-1" style={{ color: C[500] }}>Booking Code</p>
                            <p className="text-3xl font-extrabold tracking-wider" style={{ color: C[700] }}>{bookingCode}</p>
                        </div>

                        {/* Email confirmation + account message */}
                        <div className="space-y-3 mb-5">
                            <div className="flex items-center gap-3 p-4 rounded-xl border text-left" style={{ background: `${C[50]}22`, borderColor: `${C[200]}33` }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C[100]}44` }}>
                                    <Mail size={18} style={{ color: C[700] }} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Confirmation email sent!</p>
                                    <p className="text-xs text-gray-500">A booking confirmation email has been sent to <strong>{guestDetails.email}</strong>. Please check your inbox.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 text-left">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-amber-50">
                                    <UserPlus size={18} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">View booking in your profile</p>
                                    <p className="text-xs text-gray-500">Sign in or create an account with <strong>{guestDetails.email}</strong> to view and manage your booking details anytime.</p>
                                </div>
                            </div>
                        </div>

                        {/* Download Invoice */}
                        <button
                            onClick={generateInvoicePDF}
                            className="w-full flex items-center justify-center gap-2 mb-4 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 text-white"
                            style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`, boxShadow: `0 4px 14px ${C[500]}44` }}
                        >
                            <Download size={18} />
                            Download Invoice PDF
                        </button>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => navigate('/my-event-bookings')}
                                className="text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:opacity-90"
                                style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`, boxShadow: `0 4px 14px ${C[500]}44` }}
                            >
                                View My Event Bookings
                            </button>
                            <button onClick={() => { setTab('browse'); setCheckoutStep(0); }} className="border-2 border-gray-200 text-gray-600 px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition">
                                Browse Halls
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="text-white py-8 px-4" style={{ background: `linear-gradient(135deg, ${C[800]}, ${C[700]})` }}>
                <div className="max-w-6xl mx-auto">
                    <button onClick={() => navigate('/')} className="hover:text-white text-sm mb-3 flex items-center gap-1" style={{ color: C[100] }}><ArrowLeft size={14} /> Back to Home</button>
                    <h1 className="text-4xl font-extrabold mb-2">Event Halls</h1>
                    <p className="text-lg" style={{ color: C[100] }}>Find and book the perfect venue for your special occasion</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* ===== BROWSE TAB ===== */}
                {tab === 'browse' && (
                    <>
                        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="text" placeholder="Search halls by name..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 outline-none" style={{ '--tw-ring-color': C[500] }} />
                            </div>
                            <button type="submit" className="px-6 py-3 text-white rounded-xl font-semibold transition hover:opacity-90" style={{ background: C[700] }}>Search</button>
                        </form>

                        {loading ? (
                            <div className="flex items-center justify-center py-16"><RefreshCw className="animate-spin w-8 h-8" style={{ color: C[500] }} /></div>
                        ) : halls.length === 0 ? (
                            <div className="text-center py-16"><PartyPopper className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl text-gray-500">No event halls available</h3></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {halls.map(hall => (
                                    <div key={hall._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                                        <div className="h-48 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${C[100]}, ${C[50]})` }}>
                                            {hall.images?.[0] ? (
                                                <img src={hall.images[0]} alt={hall.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center" style={{ color: C[400] }}><PartyPopper size={48} /></div>
                                            )}
                                            <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-bold shadow" style={{ color: C[700] }}>Rs. {hall.pricePerHour?.toLocaleString()}/hr</div>
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
                                                    {hall.facilities.slice(0, 4).map((f, i) => <span key={i} className="px-2 py-0.5 text-[10px] font-semibold rounded-full" style={{ background: `${C[50]}44`, color: C[700] }}>{f}</span>)}
                                                    {hall.facilities.length > 4 && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full">+{hall.facilities.length - 4}</span>}
                                                </div>
                                            )}
                                            <button onClick={() => startBooking(hall)} className="w-full py-2.5 text-white rounded-xl font-semibold text-sm transition-all shadow-sm hover:opacity-90" style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})` }}>Book Now</button>
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
                                            <div className="px-6 py-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})` }}>
                                                <Calendar size={20} className="text-white" />
                                                <h2 className="text-lg font-bold text-white">Event Details</h2>
                                            </div>
                                            <div className="p-6 space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Type *</label>
                                                        <select value={bookingForm.eventType} onChange={e => setBookingForm({ ...bookingForm, eventType: e.target.value })} className={inputClass} style={{ '--tw-ring-color': C[500] }}>
                                                            <option value="">Select Type</option>
                                                            {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Date *</label>
                                                        <style>{`
                                                            .event-datepicker-wrapper .react-datepicker-wrapper { width: 100%; }
                                                            .event-datepicker-wrapper .react-datepicker__input-container input {
                                                                width: 100%; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; border-radius: 0.75rem;
                                                                font-size: 0.875rem; background: #f9fafb; outline: none; transition: all 0.2s; cursor: pointer;
                                                            }
                                                            .event-datepicker-wrapper .react-datepicker__input-container input:focus {
                                                                border-color: ${C[500]}; box-shadow: 0 0 0 2px ${C[500]}33;
                                                            }
                                                            .event-datepicker-wrapper .react-datepicker {
                                                                font-family: inherit; border: 1px solid #e5e7eb; border-radius: 1rem;
                                                                box-shadow: 0 10px 40px rgba(0,0,0,0.12); overflow: hidden;
                                                            }
                                                            .event-datepicker-wrapper .react-datepicker__header {
                                                                background: ${C[700]}; border-bottom: none; padding-top: 12px; border-radius: 0;
                                                            }
                                                            .event-datepicker-wrapper .react-datepicker__current-month { color: white; font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; }
                                                            .event-datepicker-wrapper .react-datepicker__day-name { color: ${C[100]}; font-weight: 600; font-size: 0.75rem; }
                                                            .event-datepicker-wrapper .react-datepicker__day {
                                                                border-radius: 0.5rem; font-weight: 500; transition: all 0.15s; font-size: 0.85rem;
                                                            }
                                                            .event-datepicker-wrapper .react-datepicker__day:hover { background: ${C[50]}; color: ${C[700]}; }
                                                            .event-datepicker-wrapper .react-datepicker__day--selected { background: ${C[700]} !important; color: white !important; font-weight: 700; }
                                                            .event-datepicker-wrapper .react-datepicker__day--keyboard-selected { background: ${C[100]}; color: ${C[800]}; }
                                                            .event-datepicker-wrapper .react-datepicker__day--disabled { color: #d1d5db !important; cursor: not-allowed; }
                                                            .event-datepicker-wrapper .react-datepicker__day--today { font-weight: 800; color: ${C[700]}; }
                                                            .event-datepicker-wrapper .react-datepicker__navigation-icon::before { border-color: white; }
                                                            .event-datepicker-wrapper .react-datepicker__navigation:hover *::before { border-color: ${C[100]}; }
                                                            .event-datepicker-wrapper .react-datepicker__triangle { display: none; }
                                                        `}</style>
                                                        <div className="event-datepicker-wrapper">
                                                            <DatePicker
                                                                selected={bookingForm.eventDate}
                                                                onChange={(date) => setBookingForm({ ...bookingForm, eventDate: date })}
                                                                minDate={new Date()}
                                                                dateFormat="MMMM d, yyyy"
                                                                placeholderText="Select event date"
                                                                showPopperArrow={false}
                                                                popperPlacement="bottom-start"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Time *</label>
                                                        <input type="time" value={bookingForm.startTime} onChange={e => setBookingForm({ ...bookingForm, startTime: e.target.value })} className={inputClass} style={{ '--tw-ring-color': C[500] }} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Time *</label>
                                                        <input type="time" value={bookingForm.endTime} onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })} className={inputClass} style={{ '--tw-ring-color': C[500] }} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Number of Guests *</label>
                                                        <input type="number" value={bookingForm.guestCount} onChange={e => setBookingForm({ ...bookingForm, guestCount: parseInt(e.target.value) })} className={inputClass} style={{ '--tw-ring-color': C[500] }} min={1} max={selectedHall.capacity?.max} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Notes <span className="font-normal text-gray-400">(optional)</span></label>
                                                    <textarea value={bookingForm.specialNotes} onChange={e => setBookingForm({ ...bookingForm, specialNotes: e.target.value })} className={`${inputClass} h-20 resize-none`} style={{ '--tw-ring-color': C[500] }} placeholder="Any special requirements..." />
                                                </div>

                                                {/* Availability indicator */}
                                                {availability && (
                                                    <div className={`p-4 rounded-xl border flex items-center gap-2 text-sm font-medium ${availability.available ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                                        {availability.available ? <><CheckCircle size={18} /> This slot is available!</> : <><XCircle size={18} /> This slot is taken. Choose a different date or time.</>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Booking Person Details — with email/phone validation */}
                                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="px-6 py-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})` }}>
                                                <Users size={20} className="text-white" />
                                                <h2 className="text-lg font-bold text-white">Booking Person Details</h2>
                                            </div>
                                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name *</label>
                                                    <input type="text" className={inputClass} style={{ '--tw-ring-color': C[500] }} placeholder="John" value={guestDetails.firstName} onChange={e => setGuestDetails({ ...guestDetails, firstName: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name *</label>
                                                    <input type="text" className={inputClass} style={{ '--tw-ring-color': C[500] }} placeholder="Doe" value={guestDetails.lastName} onChange={e => setGuestDetails({ ...guestDetails, lastName: e.target.value })} />
                                                </div>

                                                {/* Email with validation */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                                                    {emailError && (
                                                        <div className="flex items-center gap-1.5 mb-2 text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                                            <AlertCircle size={14} /> {emailError}
                                                        </div>
                                                    )}
                                                    <input
                                                        type="email"
                                                        className={`${inputClass} ${emailError ? 'border-red-400 bg-red-50/50 focus:ring-red-400' : ''}`}
                                                        style={!emailError ? { '--tw-ring-color': C[500] } : {}}
                                                        placeholder="john@example.com"
                                                        value={guestDetails.email}
                                                        onChange={e => {
                                                            setGuestDetails({ ...guestDetails, email: e.target.value });
                                                            if (emailError) validateEmail(e.target.value);
                                                        }}
                                                        onBlur={() => validateEmail(guestDetails.email)}
                                                    />
                                                </div>

                                                {/* Phone with country code picker */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone *</label>
                                                    {phoneError && (
                                                        <div className="flex items-center gap-1.5 mb-2 text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                                            <AlertCircle size={14} /> {phoneError}
                                                        </div>
                                                    )}
                                                    <div className="relative flex" ref={countryPickerRef}>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCountryPicker(!showCountryPicker)}
                                                            className={`flex items-center gap-2 px-3 py-3 border rounded-l-xl text-sm bg-gray-50 hover:bg-gray-100 transition-all shrink-0 ${phoneError ? 'border-red-400' : 'border-gray-200'}`}
                                                            style={{ borderRight: 'none' }}
                                                        >
                                                            <img src={selectedCountry.flag} alt={selectedCountry.code} className="w-6 h-4 object-cover rounded-sm shadow-sm" />
                                                            <span className="font-semibold text-gray-700 text-xs">{selectedCountry.dial}</span>
                                                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showCountryPicker ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        <input
                                                            type="tel"
                                                            className={`flex-1 px-4 py-3 border rounded-r-xl outline-none text-sm bg-gray-50 transition-all focus:ring-2 focus:border-transparent ${phoneError ? 'border-red-400 bg-red-50/50 focus:ring-red-400' : 'border-gray-200'}`}
                                                            style={!phoneError ? { '--tw-ring-color': C[500] } : {}}
                                                            placeholder="77 123 4567"
                                                            value={guestDetails.phone}
                                                            onChange={e => {
                                                                const val = e.target.value.replace(/[^\d\s-]/g, '');
                                                                setGuestDetails({ ...guestDetails, phone: val });
                                                                if (phoneError) validatePhone(val);
                                                            }}
                                                            onBlur={() => validatePhone(guestDetails.phone)}
                                                        />

                                                        {showCountryPicker && (
                                                            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden" style={{ zIndex: 9999, boxShadow: `0 10px 40px ${C[900]}22` }}>
                                                                <div className="px-4 py-2.5 border-b border-gray-100" style={{ background: `${C[50]}44` }}>
                                                                    <p className="text-xs font-semibold" style={{ color: C[700] }}>Select Country</p>
                                                                </div>
                                                                <ul className="max-h-52 overflow-y-auto">
                                                                    {countries.map(c => (
                                                                        <li
                                                                            key={c.code}
                                                                            onClick={() => {
                                                                                setSelectedCountry(c);
                                                                                setShowCountryPicker(false);
                                                                                setPhoneError('');
                                                                            }}
                                                                            className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors text-sm ${selectedCountry.code === c.code ? '' : 'hover:bg-gray-50'}`}
                                                                            style={selectedCountry.code === c.code ? { background: `${C[50]}66` } : {}}
                                                                        >
                                                                            <img src={c.flag} alt={c.code} className="w-6 h-4 object-cover rounded-sm shadow-sm" />
                                                                            <span className="font-medium text-gray-800 flex-1 text-xs">{c.name}</span>
                                                                            <span className="text-gray-400 font-mono text-xs">{c.dial}</span>
                                                                            {selectedCountry.code === c.code && <CheckCircle size={12} style={{ color: C[500] }} />}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button onClick={handleContinueToPayment} disabled={!availability?.available || !quote || formLoading}
                                            className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 hover:shadow-xl hover:-translate-y-0.5"
                                            style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`, boxShadow: `0 4px 14px ${C[500]}44` }}>
                                            {formLoading ? 'Processing...' : 'Continue to Payment'} <ArrowRight size={20} />
                                        </button>
                                    </>
                                )}

                                {checkoutStep === 2 && (
                                    <>
                                        <button onClick={() => setCheckoutStep(1)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition mb-2">
                                            <ArrowLeft size={16} /> Back to Details
                                        </button>
                                        <PaymentGateway
                                            bookingId={holdId}
                                            bookingType="event"
                                            userId={userId}
                                            amount={quote?.hallCharge || 0}
                                            taxAmount={quote?.taxesFees || 0}
                                            serviceCharge={0}
                                            totalAmount={quote?.totalAmount || 0}
                                            onSuccess={handlePaymentSuccess}
                                            onFailure={() => { }}
                                            guestDetails={guestDetails}
                                            bookingCode={bookingCode}
                                            checkIn={formatDateForApi(bookingForm.eventDate)}
                                            checkOut={`${bookingForm.startTime} - ${bookingForm.endTime}`}
                                        />
                                    </>
                                )}
                            </div>

                            {/* Right: Summary */}
                            <div className="lg:w-[38%]">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-6 overflow-hidden">
                                    <div className="px-6 py-4" style={{ background: `linear-gradient(135deg, ${C[900]}, ${C[800]})` }}>
                                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                            <Lock size={16} style={{ color: C[100] }} /> Booking Summary
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <h4 className="font-bold text-gray-900 mb-1">{selectedHall.name}</h4>
                                        {selectedHall.location && <p className="text-sm text-gray-500 flex items-center gap-1 mb-4"><MapPin size={14} /> {selectedHall.location}</p>}
                                        <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
                                            {bookingForm.eventType && <div className="flex justify-between"><span className="text-gray-500">Event</span><span className="font-semibold">{bookingForm.eventType}</span></div>}
                                            {bookingForm.eventDate && <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-semibold">{formatDateForApi(bookingForm.eventDate)}</span></div>}
                                            <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-semibold">{bookingForm.startTime} – {bookingForm.endTime}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Guests</span><span className="font-semibold">{bookingForm.guestCount}</span></div>
                                        </div>
                                        {quote && (
                                            <div className="space-y-2 text-sm mt-4 pt-4 border-t border-gray-100">
                                                <div className="flex justify-between"><span className="text-gray-500">Hall Charge ({quote.durationHours}h)</span><span className="font-semibold">Rs. {quote.hallCharge?.toLocaleString()}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-500">Taxes & Fees</span><span className="font-semibold">Rs. {quote.taxesFees?.toLocaleString()}</span></div>
                                                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                                                    <span className="text-base font-bold text-gray-900">Total</span>
                                                    <span className="text-2xl font-extrabold" style={{ color: C[700] }}>Rs. {quote.totalAmount?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EventHalls;
