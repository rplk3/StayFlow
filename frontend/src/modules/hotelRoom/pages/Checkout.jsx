import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { validateAndQuote, createHold, checkoutBooking, createTransport } from '../services/bookingApi';
import { CheckCircle, AlertCircle, CreditCard, User, Shield, MapPin, ArrowRight, ArrowLeft, Car, Sparkles, Lock, Calendar, Moon } from 'lucide-react';
import TransportSection from '../../transport/components/TransportSection';

const Checkout = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
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
    const [step, setStep] = useState(1); // 1: Details + Transport, 2: Payment, 3: Success

    const [guestDetails, setGuestDetails] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [holdId, setHoldId] = useState(null);
    const [bookingCode, setBookingCode] = useState(null);

    // Transport state
    const [transportData, setTransportData] = useState({ enabled: false, estimatedCost: 0 });

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
        try {
            setLoading(true);
            const holdRes = await createHold({
                userId: 'USER_123',
                hotelId: urlParams.hotelId,
                roomId: urlParams.roomId,
                ratePlanId: urlParams.ratePlanId,
                guestDetails,
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

    const handleConfirmBooking = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const checkoutRes = await checkoutBooking(holdId, { paymentToken: 'tok_mock123' });
            const booking = checkoutRes.data.booking;
            setBookingCode(booking.bookingCode);

            // If transport was requested, create it now
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

    const inputClass = "w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-gray-50 transition-all";

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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${step >= s.num ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-200 text-gray-500'}`}>
                            {step > s.num ? <CheckCircle size={18} /> : s.num}
                        </div>
                        <span className={`text-xs mt-2 font-medium whitespace-nowrap ${step >= s.num ? 'text-blue-700' : 'text-gray-400'}`}>{s.label}</span>
                    </div>
                    {i < 2 && (
                        <div className={`w-16 md:w-24 h-0.5 mx-2 mt-[-16px] rounded-full transition-all duration-500 ${step > s.num ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    if (loading && !quote) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Checking availability and calculating rates...</p>
            </div>
        );
    }
    
    // Success screen
    if (step === 3) {
        return (
            <div className="max-w-2xl mx-auto p-6 md:p-12 mt-8">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 text-center relative overflow-hidden">
                    {/* Decorative background */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-50 rounded-full opacity-50"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-50 rounded-full opacity-50"></div>
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
                            <CheckCircle size={40} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Booking Confirmed!</h1>
                        <p className="text-gray-500 mb-6">Your reservation has been secured successfully</p>
                        
                        <div className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100">
                            <p className="text-sm text-blue-600 font-medium mb-1">Itinerary Code</p>
                            <p className="text-3xl font-extrabold text-blue-700 tracking-wider">{bookingCode}</p>
                        </div>

                        {transportData.enabled && (
                            <div className="bg-indigo-50 rounded-2xl p-5 mb-6 border border-indigo-100 text-left">
                                <div className="flex items-center gap-2 mb-2">
                                    <Car size={18} className="text-indigo-600" />
                                    <span className="font-bold text-indigo-900 text-sm">Transport Booked</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-indigo-700">
                                    <div><span className="text-indigo-400">Vehicle:</span> {transportData.vehicleType}</div>
                                    <div><span className="text-indigo-400">Cost:</span> Rs. {transportData.estimatedCost?.toLocaleString()}</div>
                                    <div className="col-span-2"><span className="text-indigo-400">Pickup:</span> {transportData.pickupAddress}</div>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button onClick={() => navigate('/my-trips')} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200">
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
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center gap-3">
                                    <User size={20} className="text-white" />
                                    <h2 className="text-lg font-bold text-white">Guest Details</h2>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                                            <input required type="text" className={inputClass} placeholder="John" value={guestDetails.firstName} onChange={e => setGuestDetails({ ...guestDetails, firstName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                                            <input required type="text" className={inputClass} placeholder="Doe" value={guestDetails.lastName} onChange={e => setGuestDetails({ ...guestDetails, lastName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                            <input required type="email" className={inputClass} placeholder="john@example.com" value={guestDetails.email} onChange={e => setGuestDetails({ ...guestDetails, email: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                            <input required type="tel" className={inputClass} placeholder="+94 77 123 4567" value={guestDetails.phone} onChange={e => setGuestDetails({ ...guestDetails, phone: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transport Section */}
                            <TransportSection
                                checkInDate={urlParams.checkIn}
                                hotelDestination={searchParams.get('hotelName') || 'Hotel'}
                                onTransportChange={setTransportData}
                            />

                            {/* Continue Button */}
                            <button
                                onClick={handleContinueToPayment}
                                disabled={!quote || !guestDetails.firstName || !guestDetails.email || loading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5"
                            >
                                {loading ? 'Processing...' : 'Continue to Payment'} <ArrowRight size={20} />
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* Payment Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center gap-3">
                                    <CreditCard size={20} className="text-white" />
                                    <h2 className="text-lg font-bold text-white">Payment Information</h2>
                                </div>
                                <div className="p-6 space-y-5">
                                    {/* Amount Banner */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-600 font-medium">Amount to Charge Now</p>
                                                <p className="text-sm text-blue-400 mt-0.5">Including room & transport</p>
                                            </div>
                                            <p className="text-3xl font-extrabold text-blue-700">Rs. {grandTotal.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Card Number</label>
                                        <input required type="text" placeholder="4111 1111 1111 1111" className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry Date</label>
                                            <input required type="text" placeholder="MM / YY" className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">CVC</label>
                                            <input required type="text" placeholder="123" className={inputClass} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                                        <Lock size={14} /> Your payment information is encrypted and secure
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button onClick={() => setStep(1)} className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition">
                                    <ArrowLeft size={18} /> Back
                                </button>
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    <Shield size={20} /> {loading ? 'Processing...' : (quote?.dueNow > 0 ? 'Pay & Confirm' : 'Confirm Guarantee')}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Column — Booking Summary */}
                <div className="lg:w-[38%]">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-6 overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                <Sparkles size={18} className="text-yellow-400" /> Booking Summary
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
                                            <span>✨ Coupon Discount</span>
                                            <span className="font-semibold">- Rs. {Math.round(quote.discount).toLocaleString()}</span>
                                        </div>
                                    )}

                                    {/* Transport line */}
                                    {transportData.enabled && transportData.estimatedCost > 0 && (
                                        <div className="flex justify-between text-indigo-600">
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

                                    <div className="bg-gray-50 rounded-xl p-4 mt-3 border border-gray-100 space-y-2">
                                        <div className="flex justify-between text-blue-800">
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
                                        <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="flex-1 border border-gray-200 rounded-xl p-3 uppercase text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. SUMMER20" />
                                        <button onClick={handleApplyCoupon} className="bg-gray-800 text-white px-5 py-3 rounded-xl font-semibold hover:bg-gray-900 transition text-sm">Apply</button>
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
