import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { validateAndQuote, createHold, checkoutBooking, createTransport } from '../services/bookingApi';
import { useAuth } from '../../../context/AuthContext';
import { CheckCircle, AlertCircle, User, MapPin, ArrowRight, ArrowLeft, Car, Lock, Calendar, Moon, ChevronDown, Phone, Tag, Download, Mail, UserPlus } from 'lucide-react';
import jsPDF from 'jspdf';
import TransportSection from '../../transport/components/TransportSection';
import PaymentGateway from '../../payment/components/PaymentGateway';

/* ───────── Color palette (matching LandingPage) ───────── */
const C = {
    900: '#012A4A', 800: '#013A63', 700: '#01497C', 600: '#014F86',
    500: '#2A6F97', 400: '#2C7DA0', 300: '#468FAF', 200: '#61A5C2',
    100: '#89C2D9', 50: '#A9D6E5',
};

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    const [guestDetails, setGuestDetails] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [holdId, setHoldId] = useState(null);
    const [bookingCode, setBookingCode] = useState(null);

    // Validation state
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

    const handleApplyCoupon = () => {
        if (couponCode) loadQuote(couponCode);
    };

    const grandTotal = quote ? Math.round(quote.totalAmount + (transportData.enabled ? transportData.estimatedCost : 0)) : 0;

    const handleContinueToPayment = async (e) => {
        e.preventDefault();
        // Validate before proceeding
        const isEmailValid = validateEmail(guestDetails.email);
        const isPhoneValid = validatePhone(guestDetails.phone);
        if (!isEmailValid || !isPhoneValid) return;

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

    // Step indicator
    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-0 mb-10">
            {[
                { num: 1, label: 'Details & Transport' },
                { num: 2, label: 'Payment' },
                { num: 3, label: 'Confirmation' }
            ].map((s, i) => (
                <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= s.num ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}
                            style={step >= s.num ? { background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`, boxShadow: `0 4px 14px ${C[500]}44` } : {}}
                        >
                            {step > s.num ? <CheckCircle size={18} /> : s.num}
                        </div>
                        <span
                            className={`text-xs mt-2 font-medium whitespace-nowrap ${step >= s.num ? 'font-semibold' : 'text-gray-400'}`}
                            style={step >= s.num ? { color: C[700] } : {}}
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: C[100], borderTopColor: C[700] }}></div>
                <p className="text-gray-500 font-medium">Checking availability and calculating rates...</p>
            </div>
        );
    }
    
    // Success screen
    if (step === 3) {
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
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Booking Confirmed!</h1>
                        <p className="text-gray-500 mb-4">Your reservation has been secured successfully</p>
                        
                        <div className="rounded-2xl p-6 mb-5 border" style={{ background: `${C[50]}33`, borderColor: `${C[100]}66` }}>
                            <p className="text-sm font-medium mb-1" style={{ color: C[500] }}>Itinerary Code</p>
                            <p className="text-3xl font-extrabold tracking-wider" style={{ color: C[700] }}>{bookingCode}</p>
                        </div>

                        {transportData.enabled && (
                            <div className="rounded-2xl p-5 mb-5 border text-left" style={{ background: `${C[50]}22`, borderColor: `${C[200]}44` }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Car size={18} style={{ color: C[700] }} />
                                    <span className="font-bold text-sm" style={{ color: C[900] }}>Transport Booked</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: C[600] }}>
                                    <div><span style={{ color: C[300] }}>Vehicle:</span> {transportData.vehicleType}</div>
                                    <div><span style={{ color: C[300] }}>Cost:</span> Rs. {transportData.estimatedCost?.toLocaleString()}</div>
                                    <div className="col-span-2"><span style={{ color: C[300] }}>Pickup:</span> {transportData.pickupAddress}</div>
                                </div>
                            </div>
                        )}

                        {/* Email confirmation message */}
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

                        {/* Download Invoice + Navigation */}
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
                                onClick={() => navigate('/my-trips')}
                                className="text-white px-8 py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
                                style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`, boxShadow: `0 4px 14px ${C[500]}44` }}
                            >
                                View My Trips
                            </button>
                            <button onClick={() => navigate('/')} className="border-2 border-gray-200 text-gray-600 px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition">
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 md:py-10">
            <StepIndicator />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column — Forms */}
                <div className="lg:w-[62%] space-y-6">
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
                                            <input required type="text" className={inputClass} style={{ focusRingColor: C[500] }} placeholder="John" value={guestDetails.firstName} onChange={e => setGuestDetails({ ...guestDetails, firstName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                                            <input required type="text" className={inputClass} placeholder="Doe" value={guestDetails.lastName} onChange={e => setGuestDetails({ ...guestDetails, lastName: e.target.value })} />
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
                                            <div className="relative flex" ref={countryPickerRef}>
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
                                                        const val = e.target.value.replace(/[^\d\s-]/g, '');
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
                            />

                            {/* Continue Button */}
                            <button
                                onClick={handleContinueToPayment}
                                disabled={!quote || !guestDetails.firstName || !guestDetails.email || loading}
                                className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5"
                                style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`, boxShadow: `0 4px 14px ${C[500]}44` }}
                            >
                                {loading ? 'Processing...' : 'Continue to Payment'} <ArrowRight size={20} />
                            </button>
                        </>
                    )}

                    {step === 2 && (
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
                                onFailure={() => {}}
                                guestDetails={guestDetails}
                                bookingCode={bookingCode}
                                checkIn={urlParams.checkIn}
                                checkOut={urlParams.checkOut}
                            />
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
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span className="flex items-center gap-1"><Moon size={14} /> Room ({quote.nights} nights)</span>
                                        <span className="font-semibold">Rs. {Math.round(quote.roomTotal).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Taxes & Fees</span>
                                        <span className="font-semibold">Rs. {Math.round(quote.taxesFees).toLocaleString()}</span>
                                    </div>
                                    {quote.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
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
                                    
                                    <div className="border-t border-gray-200 pt-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-base font-bold text-gray-900">Grand Total</span>
                                            <span className="text-2xl font-extrabold text-gray-900">Rs. {grandTotal.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="rounded-xl p-4 mt-3 border space-y-2" style={{ background: `${C[50]}22`, borderColor: `${C[100]}66` }}>
                                        <div className="flex justify-between" style={{ color: C[800] }}>
                                            <span className="font-semibold text-xs">Due Now:</span>
                                            <span className="font-bold text-sm">Rs. {Math.round(quote.dueNow + (transportData.enabled ? transportData.estimatedCost : 0)).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500 text-xs">
                                            <span>Due at Hotel:</span>
                                            <span className="font-semibold">Rs. {Math.round(quote.dueAtHotel).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 1 && (
                                <div className="mt-5 pt-5 border-t border-gray-100">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Promo Code</label>
                                    <div className="flex gap-2">
                                        <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="flex-1 border border-gray-200 rounded-xl p-3 uppercase text-sm bg-gray-50 focus:ring-2 outline-none" style={{ '--tw-ring-color': C[500] }} placeholder="e.g. SUMMER20" />
                                        <button
                                            onClick={handleApplyCoupon}
                                            className="text-white px-5 py-3 rounded-xl font-semibold hover:opacity-90 transition text-sm"
                                            style={{ background: C[800] }}
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {couponApplied && <p className="text-green-600 text-xs mt-2 font-medium flex items-center gap-1"><CheckCircle size={12} /> Coupon {couponApplied} applied!</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

