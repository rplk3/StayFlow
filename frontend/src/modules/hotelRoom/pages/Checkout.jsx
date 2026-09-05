import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { validateAndQuote, createHold, checkoutBooking, createTransport } from '../services/bookingApi';
import { useAuth } from '../../../context/AuthContext';
import { Check, CheckCircle, AlertCircle, User, MapPin, ArrowRight, ArrowLeft, Car, Lock, Calendar, Moon, ChevronDown, Phone, Tag, Download, Mail, UserPlus, Share2, MessageCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import TransportSection from '../../transport/components/TransportSection';
import PaymentGateway from '../../payment/components/PaymentGateway';

/* ───────── Global Color System ───────── */
const C = {
    // Semantic Tokens
    primary: '#0F2D52', action: '#1D6FE8', accent: '#F59E0B', 
    success: '#16A34A', alert: '#C0392B', bg: '#F4F6F9', 
    card: '#FFFFFF', text: '#1A1A2E',
    
    // Legacy mapping to prevent breakages
    900: '#0F2D52', 800: '#0F2D52', 700: '#0F2D52', 600: '#1D6FE8',
    500: '#1D6FE8', 400: '#1D6FE8', 300: '#60A5FA', 200: '#BFDBFE',
    100: '#DBEAFE', 50: '#F0F9FF',
};

/* ───────── Country data for phone picker ───────── */
const countries = [
    { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: 'https://flagcdn.com/lk.svg', phoneLengths: [9] },
    { code: 'IN', name: 'India', dial: '+91', flag: 'https://flagcdn.com/in.svg', phoneLengths: [10] },
    { code: 'US', name: 'United States', dial: '+1', flag: 'https://flagcdn.com/us.svg', phoneLengths: [10] },
    { code: 'GB', name: 'United Kingdom', dial: '+44', flag: 'https://flagcdn.com/gb.svg', phoneLengths: [10, 11] },
    { code: 'AU', name: 'Australia', dial: '+61', flag: 'https://flagcdn.com/au.svg', phoneLengths: [9] },
    { code: 'AE', name: 'UAE', dial: '+971', flag: 'https://flagcdn.com/ae.svg', phoneLengths: [9] },
    { code: 'SG', name: 'Singapore', dial: '+65', flag: 'https://flagcdn.com/sg.svg', phoneLengths: [8] },
    { code: 'MY', name: 'Malaysia', dial: '+60', flag: 'https://flagcdn.com/my.svg', phoneLengths: [9, 10] },
    { code: 'JP', name: 'Japan', dial: '+81', flag: 'https://flagcdn.com/jp.svg', phoneLengths: [10, 11] },
    { code: 'DE', name: 'Germany', dial: '+49', flag: 'https://flagcdn.com/de.svg', phoneLengths: [10, 11] },
    { code: 'FR', name: 'France', dial: '+33', flag: 'https://flagcdn.com/fr.svg', phoneLengths: [9] },
    { code: 'CA', name: 'Canada', dial: '+1', flag: 'https://flagcdn.com/ca.svg', phoneLengths: [10] },
    { code: 'NZ', name: 'New Zealand', dial: '+64', flag: 'https://flagcdn.com/nz.svg', phoneLengths: [8, 9] },
    { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: 'https://flagcdn.com/sa.svg', phoneLengths: [9] },
    { code: 'CN', name: 'China', dial: '+86', flag: 'https://flagcdn.com/cn.svg', phoneLengths: [11] },
];

const Checkout = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const urlParams = {
        hotelId: searchParams.get('hotelId'),
        roomId: searchParams.get('roomId'),
        ratePlanId: searchParams.get('ratePlanId'),
        checkIn: searchParams.get('checkIn'),
        checkOut: searchParams.get('checkOut'),
        guests: parseInt(searchParams.get('guests')) || 2
    };

    const [quote, setQuote] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [couponApplied, setCouponApplied] = useState('');
    const [couponError, setCouponError] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    const [guestDetails, setGuestDetails] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [holdId, setHoldId] = useState(null);
    const [bookingCode, setBookingCode] = useState(null);

    // Validation state
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(countries[0]);
    const [showCountryPicker, setShowCountryPicker] = useState(false);
    const countryPickerRef = useRef(null);

    // Transport state
    const [transportData, setTransportData] = useState({ enabled: false, estimatedCost: 0 });

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
        if (!re.test(email)) {
            setEmailError('Enter a valid email address');
            return false;
        }
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

    const loadQuote = async (code = '') => {
        try {
            setLoading(true);
            setError('');
            const res = await validateAndQuote({
                hotelId: urlParams.hotelId,
                roomId: urlParams.roomId,
                ratePlanId: urlParams.ratePlanId,
                checkInDate: urlParams.checkIn,
                checkOutDate: urlParams.checkOut,
                guests: urlParams.guests,
                couponCode: code
            });
            setQuote(res.data);
            if (code) setCouponApplied(code);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate quote');
            setQuote(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (urlParams.hotelId) loadQuote();
    }, []);

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponError('');
        try {
            setLoading(true);
            const res = await validateAndQuote({
                hotelId: urlParams.hotelId,
                roomId: urlParams.roomId,
                ratePlanId: urlParams.ratePlanId,
                checkInDate: urlParams.checkIn,
                checkOutDate: urlParams.checkOut,
                guests: urlParams.guests,
                couponCode: couponCode
            });
            setQuote(res.data);
            setCouponApplied(couponCode);
            setCouponError('');
        } catch (err) {
            setCouponError(err.response?.data?.error || 'Invalid promo code');
            setCouponApplied('');
        } finally {
            setLoading(false);
        }
    };

    const grandTotal = quote ? Math.round(quote.totalAmount + (transportData.enabled ? transportData.estimatedCost : 0)) : 0;

    const validateFirstName = (val) => {
        if (!val.trim()) { setFirstNameError('First name is required'); return false; }
        setFirstNameError(''); return true;
    };
    const validateLastName = (val) => {
        if (!val.trim()) { setLastNameError('Last name is required'); return false; }
        setLastNameError(''); return true;
    };

    const handleContinueToPayment = async (e) => {
        e.preventDefault();
        setSubmitAttempted(true);
        // Validate before proceeding
        const isFnValid = validateFirstName(guestDetails.firstName);
        const isLnValid = validateLastName(guestDetails.lastName);
        const isEmailValid = validateEmail(guestDetails.email);
        const isPhoneValid = validatePhone(guestDetails.phone);
        
        if (!isFnValid || !isLnValid || !isEmailValid || !isPhoneValid) return;
        if (transportData.enabled && !transportData.pickupCoords) return;

        try {
            setLoading(true);
            const holdRes = await createHold({
                userId: user ? user.email : guestDetails.email,
                hotelId: urlParams.hotelId,
                roomId: urlParams.roomId,
                ratePlanId: urlParams.ratePlanId,
                guestDetails: {
                    ...guestDetails,
                    phone: `${selectedCountry.dial} ${guestDetails.phone}`
                },
                checkInDate: urlParams.checkIn,
                checkOutDate: urlParams.checkOut,
                guests: urlParams.guests,
                nights: quote.nights,
                pricing: {
                    roomTotal: quote.roomTotal,
                    taxesFees: quote.taxesFees,
                    discount: quote.discount,
                    totalAmount: quote.totalAmount,
                    dueNow: quote.dueNow,
                    dueAtHotel: quote.dueAtHotel
                }
            });
            setHoldId(holdRes.data._id);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to hold room');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentResult) => {
        try {
            setLoading(true);
            const checkoutRes = await checkoutBooking(holdId, { paymentToken: 'tok_mock123' });
            const booking = checkoutRes.data.booking;
            setBookingCode(booking.bookingCode);

            if (transportData.enabled) {
                try {
                    await createTransport({
                        bookingId: booking._id,
                        pickupDate: transportData.pickupDate,
                        pickupTime: transportData.pickupTime,
                        pickupAddress: transportData.pickupAddress,
                        pickupCoords: transportData.pickupCoords,
                        dropoffAddress: transportData.dropoffAddress,
                        dropoffCoords: transportData.dropoffCoords,
                        vehicleType: transportData.vehicleType,
                        passengerCount: transportData.passengerCount,
                        specialRequests: transportData.specialRequests,
                        estimatedDistance: transportData.estimatedDistance,
                        estimatedCost: transportData.estimatedCost
                    });
                } catch (transportErr) {
                    console.error('Transport booking failed:', transportErr);
                }
            }

            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none text-sm bg-gray-50 transition-all";

    // ── Generate Invoice PDF for success screen ──
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
        doc.text('Booking Confirmation', 20, 33);

        doc.setFontSize(9);
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 20, 25, { align: 'right' });
        doc.text(`Booking Code: ${bookingCode || 'N/A'}`, pageWidth - 20, 33, { align: 'right' });

        let y = 58;
        doc.setTextColor(1, 42, 74);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Guest Information', 20, y); y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Name: ${guestDetails.firstName} ${guestDetails.lastName}`, 20, y); y += 6;
        doc.text(`Email: ${guestDetails.email}`, 20, y); y += 6;
        doc.text(`Phone: ${selectedCountry.dial} ${guestDetails.phone}`, 20, y); y += 12;

        doc.setTextColor(1, 42, 74);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Stay Details', 20, y); y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text(`Check-in: ${urlParams.checkIn}`, 20, y); y += 6;
        doc.text(`Check-out: ${urlParams.checkOut}`, 20, y); y += 6;
        doc.text(`Guests: ${urlParams.guests}`, 20, y); y += 6;
        if (quote) doc.text(`Nights: ${quote.nights}`, 20, y); y += 12;

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
        const rows = [['Room Charge', Math.round(quote?.roomTotal || 0).toLocaleString()]];
        if (quote?.taxesFees > 0) rows.push(['Taxes & Fees', Math.round(quote.taxesFees).toLocaleString()]);
        if (quote?.discount > 0) rows.push(['Discount', `- ${Math.round(quote.discount).toLocaleString()}`]);
        if (transportData.enabled) rows.push([`Transport (${transportData.vehicleType})`, transportData.estimatedCost.toLocaleString()]);

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
        doc.text('Grand Total', 25, y + 5);
        doc.text(`Rs. ${grandTotal.toLocaleString()}`, pageWidth - 25, y + 5, { align: 'right' });

        const footerY = doc.internal.pageSize.getHeight() - 20;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('StayFlow | www.stayflow.com | support@stayflow.com', pageWidth / 2, footerY, { align: 'center' });
        doc.text('Thank you for choosing StayFlow!', pageWidth / 2, footerY + 5, { align: 'center' });

        doc.save(`StayFlow_Booking_${bookingCode || 'receipt'}.pdf`);
    };

    // Add booking to calendar (.ics download)
    const handleAddToCalendar = () => {
        const start = urlParams.checkIn?.replace(/-/g, '') || '';
        const end = urlParams.checkOut?.replace(/-/g, '') || '';
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//StayFlow//Booking//EN',
            'BEGIN:VEVENT',
            `DTSTART;VALUE=DATE:${start}`,
            `DTEND;VALUE=DATE:${end}`,
            `SUMMARY:StayFlow Hotel Booking - ${bookingCode || 'Reservation'}`,
            `DESCRIPTION:Your hotel stay. Booking Reference: ${bookingCode}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StayFlow_Booking_${bookingCode || 'event'}.ics`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Step indicator
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-0 mb-6">
            {[
                { num: 1, label: 'Details & Transport' },
                { num: 2, label: 'Payment' },
                { num: 3, label: 'Confirmation' }
            ].map((s, i) => (
                <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step === s.num ? 'text-white shadow-lg' : step > s.num ? 'bg-blue-50 border-2' : 'bg-gray-200 text-gray-500'}`}
                            style={step === s.num ? { background: `linear-gradient(135deg, ${C.primary || C[900]}, ${C.action || C[600]})`, boxShadow: `0 4px 14px ${C.action || C[600]}44` } : step > s.num ? { color: C.action || C[600], borderColor: C.action || C[600] } : {}}
                        >
                            {step > s.num ? <Check size={20} style={{ color: C.action || C[600] }} /> : s.num}
                        </div>
                        <span
                            className={`text-xs mt-2 font-medium whitespace-nowrap ${step >= s.num ? 'font-bold' : 'text-gray-400'}`}
                            style={step >= s.num ? { color: C.primary || C[900] } : {}}
                        >
                            {s.label}
                        </span>
                    </div>
                    {i < 2 && (
                        <div
                            className="w-16 md:w-24 h-0.5 mx-2 mt-[-16px] rounded-full transition-all duration-500"
                            style={{ background: step > s.num ? C[500] : '#e5e7eb' }}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    if (loading && !quote) {
        return (
        <div className="min-h-screen bg-cover bg-center bg-fixed relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md"></div>
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] gap-4 pt-20">
                <div className="w-12 h-12 border-4 rounded-full animate-spin shadow-lg" style={{ borderColor: C[100], borderTopColor: C[700] }}></div>
                <p className="text-gray-800 font-bold bg-white/80 px-4 py-2 rounded-lg shadow-sm">Checking availability and calculating rates...</p>
            </div>
        </div>
        );
    }

    // Success screen
    if (step === 3) {
        return (
        <div className="min-h-screen bg-cover bg-center bg-fixed relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80')" }}>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md"></div>
            <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-8 pt-10">
                {/* Horizontal Success Card */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: `linear-gradient(90deg, ${C[500]}, ${C[300]}, ${C[100]})` }}></div>

                    <div className="flex flex-col lg:flex-row">
                        {/* Left — Confirmation Header + Details */}
                        <div className="lg:w-[55%] p-6 lg:p-8 lg:border-r border-gray-100">
                            {/* Success Badge */}
                            <div className="flex items-center gap-4 mb-5">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-lg" style={{ background: `linear-gradient(135deg, ${C[500]}, ${C[700]})`, boxShadow: `0 8px 24px ${C[500]}33` }}>
                                    <CheckCircle size={32} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-extrabold text-gray-900">Booking Confirmed!</h1>
                                    <p className="text-gray-500 text-sm">Your reservation has been secured</p>
                                </div>
                            </div>

                            {/* Itinerary Code */}
                            <div className="rounded-xl py-3 px-4 mb-4 border flex items-center justify-between" style={{ background: `${C[50]}33`, borderColor: `${C[100]}66` }}>
                                <span className="text-sm font-medium" style={{ color: C[500] }}>Itinerary Code</span>
                                <span className="text-xl font-extrabold tracking-wider" style={{ color: C[700] }}>{bookingCode}</span>
                            </div>

                            {/* Booking Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                <div className="rounded-xl p-3 border text-left" style={{ background: `${C[50]}22`, borderColor: `${C[200]}44` }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Moon size={16} style={{ color: C[700] }} />
                                        <span className="font-bold text-xs" style={{ color: C[900] }}>Hotel Stay</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 text-xs" style={{ color: C[600] }}>
                                        <div><span className="text-gray-400">In:</span> {urlParams.checkIn}</div>
                                        <div><span className="text-gray-400">Out:</span> {urlParams.checkOut}</div>
                                        <div><span className="text-gray-400">Guests:</span> {urlParams.guests}</div>
                                        <div><span className="text-gray-400">Nights:</span> {quote?.nights}</div>
                                    </div>
                                </div>

                                {transportData.enabled && (
                                    <div className="rounded-xl p-3 border text-left" style={{ background: `${C[50]}22`, borderColor: `${C[200]}44` }}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Car size={16} style={{ color: C[700] }} />
                                            <span className="font-bold text-xs" style={{ color: C[900] }}>Transport</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1 text-xs" style={{ color: C[600] }}>
                                            <div><span className="text-gray-400">Vehicle:</span> {transportData.vehicleType}</div>
                                            <div><span className="text-gray-400">Cost:</span> Rs. {transportData.estimatedCost?.toLocaleString()}</div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Notices */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2.5 p-2.5 rounded-lg border text-left" style={{ background: `${C[50]}22`, borderColor: `${C[200]}33` }}>
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C[100]}44` }}>
                                        <Mail size={14} style={{ color: C[700] }} />
                                    </div>
                                    <p className="text-xs text-gray-500">Confirmation sent to <strong className="text-gray-700">{guestDetails.email}</strong></p>
                                </div>
                                <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-100 bg-gray-50 text-left">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: '#1D6FE81A' }}>
                                        <UserPlus size={14} style={{ color: '#1D6FE8' }} />
                                    </div>
                                    <p className="text-xs text-gray-500">Sign in with <strong className="text-gray-700">{guestDetails.email}</strong> to manage bookings</p>
                                </div>
                            </div>
                        </div>

                        {/* Right — Actions */}
                        <div className="lg:w-[45%] p-6 lg:p-8 flex flex-col justify-between bg-gray-50/50">
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h3>
                                <button
                                    onClick={handleAddToCalendar}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border border-gray-200 text-gray-700 hover:bg-white hover:shadow-sm bg-white"
                                >
                                    <Calendar size={16} /> Add to Calendar
                                </button>
                                <button
                                    onClick={generateInvoicePDF}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 text-white"
                                    style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`, boxShadow: `0 4px 14px ${C[500]}33` }}
                                >
                                    <Download size={16} /> Download Invoice
                                </button>

                                {/* Share */}
                                <div className="flex items-center gap-2 pt-2">
                                    <span className="text-xs text-gray-400 flex items-center gap-1"><Share2 size={12} /> Share:</span>
                                    <a href={`https://wa.me/?text=${encodeURIComponent(`I just booked my stay at ${searchParams.get('hotelName') || 'StayFlow'}! Ref: ${bookingCode}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors text-xs font-semibold">
                                        <MessageCircle size={12} /> WhatsApp
                                    </a>
                                    <a href={`mailto:?subject=My StayFlow Booking&body=${encodeURIComponent(`I just booked at ${searchParams.get('hotelName') || 'StayFlow'}! Ref: ${bookingCode}`)}`} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-xs font-semibold">
                                        <Mail size={12} /> Email
                                    </a>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => navigate('/my-trips')}
                                    className="flex-1 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md"
                                    style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})` }}
                                >
                                    View My Trips
                                </button>
                                <button onClick={() => navigate('/')} className="flex-1 border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:bg-white transition bg-white">
                                    Home
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-cover bg-center bg-fixed relative" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" }}>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md"></div>
            <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-6 md:py-8 pt-8">
            <StepIndicator />

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column — Forms */}
                <div className="lg:w-[62%] space-y-3">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 border border-red-200 rounded-xl flex items-center gap-2 text-sm font-medium">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    {step === 1 && (
                        <>
                            {/* Guest Details Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-6 py-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})` }}>
                                    <User size={20} className="text-white" />
                                    <h2 className="text-lg font-bold text-white">Guest Details</h2>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                                            {firstNameError && <div className="flex items-center gap-1.5 mb-2 text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2"><AlertCircle size={14} />{firstNameError}</div>}
                                            <input required type="text" className={`${inputClass} ${firstNameError ? 'border-red-400 bg-red-50/50 focus:ring-red-400' : 'border-gray-200'}`} style={!firstNameError ? { '--tw-ring-color': C[500] } : {}} placeholder="John" value={guestDetails.firstName} onChange={e => { const val = e.target.value.replace(/[^A-Za-z\s]/g, ''); setGuestDetails({ ...guestDetails, firstName: val }); if (firstNameError) validateFirstName(val); }} onBlur={() => validateFirstName(guestDetails.firstName)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                                            {lastNameError && <div className="flex items-center gap-1.5 mb-2 text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2"><AlertCircle size={14} />{lastNameError}</div>}
                                            <input required type="text" className={`${inputClass} ${lastNameError ? 'border-red-400 bg-red-50/50 focus:ring-red-400' : 'border-gray-200'}`} style={!lastNameError ? { '--tw-ring-color': C[500] } : {}} placeholder="Doe" value={guestDetails.lastName} onChange={e => { const val = e.target.value.replace(/[^A-Za-z\s]/g, ''); setGuestDetails({ ...guestDetails, lastName: val }); if (lastNameError) validateLastName(val); }} onBlur={() => validateLastName(guestDetails.lastName)} />
                                        </div>

                                        {/* Email with validation */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                            {emailError && (
                                                <div className="flex items-center gap-1.5 mb-2 text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                                    <AlertCircle size={14} />
                                                    {emailError}
                                                </div>
                                            )}
                                            <input
                                                required
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
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                            {phoneError && (
                                                <div className="flex items-center gap-1.5 mb-2 text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                                    <AlertCircle size={14} />
                                                    {phoneError}
                                                </div>
                                            )}
                                            <div className="relative flex z-50" ref={countryPickerRef}>
                                                {/* Country code selector */}
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCountryPicker(!showCountryPicker)}
                                                    className={`flex items-center gap-2 px-3 py-3.5 border rounded-l-xl text-sm bg-gray-50 hover:bg-gray-100 transition-all shrink-0 ${phoneError ? 'border-red-400' : 'border-gray-200'}`}
                                                    style={{ borderRight: 'none' }}
                                                >
                                                    <img src={selectedCountry.flag} alt={selectedCountry.code} className="w-6 h-4 object-cover rounded-sm shadow-sm" />
                                                    <span className="font-semibold text-gray-700 text-xs">{selectedCountry.dial}</span>
                                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${showCountryPicker ? 'rotate-180' : ''}`} />
                                                </button>

                                                {/* Phone input */}
                                                <input
                                                    required
                                                    type="tel"
                                                    className={`flex-1 px-4 py-3.5 border rounded-r-xl outline-none text-sm bg-gray-50 transition-all focus:ring-2 focus:border-transparent ${phoneError ? 'border-red-400 bg-red-50/50 focus:ring-red-400' : 'border-gray-200'}`}
                                                    style={!phoneError ? { '--tw-ring-color': C[500] } : {}}
                                                    placeholder="77 123 4567"
                                                    value={guestDetails.phone}
                                                    onChange={e => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        if (val.length > Math.max(...selectedCountry.phoneLengths)) return;
                                                        setGuestDetails({ ...guestDetails, phone: val });
                                                        if (phoneError) validatePhone(val);
                                                    }}
                                                    onBlur={() => validatePhone(guestDetails.phone)}
                                                />

                                                {/* Country picker dropdown — simple list, no search */}
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
                                                                    {selectedCountry.code === c.code && (
                                                                        <CheckCircle size={12} style={{ color: C[500] }} />
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transport Section — pass guestCount for autofill */}
                            <TransportSection
                                checkInDate={urlParams.checkIn}
                                hotelDestination={searchParams.get('hotelName') || 'Hotel'}
                                onTransportChange={setTransportData}
                                guestCount={urlParams.guests}
                                submitAttempted={submitAttempted}
                            />

                            {/* Continue Button */}
                            <button
                                onClick={handleContinueToPayment}
                                disabled={!quote || loading}
                                className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5"
                                style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`, boxShadow: `0 4px 14px ${C[500]}44` }}
                            >
                                {loading ? 'Processing...' : 'Continue to Payment'} <ArrowRight size={20} />
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                                    <div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: C[100], borderTopColor: C[700] }}></div>
                                    <p className="font-semibold text-gray-500">Processing payment & finalizing booking...</p>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition mb-2"
                                    >
                                        <ArrowLeft size={16} /> Back to Details
                                    </button>
                                    <PaymentGateway
                                        bookingId={holdId}
                                        bookingType="room"
                                        userId={user ? user.email : guestDetails.email}
                                        amount={quote?.roomTotal || 0}
                                        taxAmount={quote?.taxesFees || 0}
                                        serviceCharge={transportData.enabled ? transportData.estimatedCost : 0}
                                        totalAmount={grandTotal}
                                        onSuccess={handlePaymentSuccess}
                                        onFailure={() => { }}
                                        guestDetails={guestDetails}
                                        bookingCode={bookingCode}
                                        checkIn={urlParams.checkIn}
                                        checkOut={urlParams.checkOut}
                                    />
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Right Column — Booking Summary */}
                <div className="lg:w-[38%]">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-6 overflow-hidden">
                        <div className="px-6 py-4" style={{ background: `linear-gradient(135deg, ${C[900]}, ${C[800]})` }}>
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                <Lock size={16} style={{ color: C[100] }} /> Booking Summary
                            </h3>
                        </div>

                        <div className="p-6">
                            {/* Dates */}
                            <div className="flex gap-4 mb-5">
                                <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1"><Calendar size={12} /> Check-in</p>
                                    <p className="font-bold text-gray-800 text-sm mt-0.5">{urlParams.checkIn}</p>
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1"><Calendar size={12} /> Check-out</p>
                                    <p className="font-bold text-gray-800 text-sm mt-0.5">{urlParams.checkOut}</p>
                                </div>
                            </div>

                            {quote && (
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span className="flex items-center gap-1"><Moon size={14} /> Room ({quote.nights} nights)</span>
                                        <span className="font-semibold">Rs. {Math.round(quote.roomTotal).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Taxes & Fees</span>
                                        <span className="font-semibold">Rs. {Math.round(quote.taxesFees).toLocaleString()}</span>
                                    </div>
                                    {quote?.discount > 0 && (
                                        <div className="flex justify-between" style={{ color: C[600] }}>
                                            <span className="flex items-center gap-1"><Tag size={14} /> Coupon Discount</span>
                                            <span className="font-semibold">- Rs. {Math.round(quote.discount).toLocaleString()}</span>
                                        </div>
                                    )}

                                    {/* Transport line */}
                                    {transportData.enabled && transportData.estimatedCost > 0 && (
                                        <div className="flex justify-between" style={{ color: C[600] }}>
                                            <span className="flex items-center gap-1"><Car size={14} /> Transport ({transportData.vehicleType})</span>
                                            <span className="font-semibold">Rs. {transportData.estimatedCost.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-base font-bold text-gray-900">Grand Total</span>
                                            <span className="text-2xl font-extrabold text-gray-900">Rs. {grandTotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {quote && (
                                        <div className="rounded-xl p-3 mt-2 border space-y-1.5" style={{ background: `${C[50]}22`, borderColor: `${C[100]}66` }}>
                                            <div className="flex justify-between" style={{ color: C[800] }}>
                                                <span className="font-semibold text-xs">Due Now:</span>
                                                <span className="font-bold text-sm">Rs. {Math.round(quote.dueNow + (transportData.enabled ? transportData.estimatedCost : 0)).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-500 text-xs">
                                                <span>Due at Hotel:</span>
                                                <span className="font-semibold">Rs. {Math.round(quote.dueAtHotel).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 1 && (
                                <div className="mt-5 pt-5 border-t border-gray-100">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Promo Code</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); if(couponApplied) { setCouponApplied(''); loadQuote(); } }} className={`flex-1 border ${couponError ? 'border-red-400 focus:ring-red-400 bg-red-50/50' : couponApplied ? 'border-green-400 focus:ring-green-400 bg-green-50/50' : 'border-gray-200 focus:ring-2 bg-gray-50'} rounded-xl p-3 uppercase text-sm outline-none transition-all duration-200`} style={!couponError && !couponApplied ? { '--tw-ring-color': C[500] } : {}} placeholder="e.g. SUMMER20" />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={loading || !couponCode || couponApplied === couponCode}
                                            className="text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ background: C[800] }}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {couponError && <p className="text-red-600 text-xs mt-2 font-medium flex items-center gap-1"><AlertCircle size={12} /> {couponError}</p>}
                                    {couponApplied && <p className="text-green-600 text-xs mt-2 font-medium flex items-center gap-1"><CheckCircle size={12} /> Coupon {couponApplied} applied!</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default Checkout;
