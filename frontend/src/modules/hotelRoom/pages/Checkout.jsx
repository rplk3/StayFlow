import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { validateAndQuote, createHold, checkoutBooking } from '../services/bookingApi';
import { CheckCircle, AlertCircle, CreditCard, User, Building } from 'lucide-react';

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
    const [step, setStep] = useState(1); // 1: Quote/Details, 2: Payment/Confirm, 3: Success

    const [guestDetails, setGuestDetails] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [holdId, setHoldId] = useState(null);
    const [bookingCode, setBookingCode] = useState(null);

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

    const handleContinueToPayment = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Step 9: Create hold
            const holdRes = await createHold({
                userId: 'USER_123', // Hardcoded mock user
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
            setBookingCode(checkoutRes.data.booking.bookingCode);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !quote) return <div className="p-8 text-center text-gray-500">Checking availability and calculating rates...</div>;
    
    if (step === 3) {
        return (
            <div className="max-w-2xl mx-auto p-10 bg-white rounded-3xl mt-12 shadow-xl text-center border border-green-100">
                <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Booking Confirmed!</h1>
                <p className="text-gray-600 mb-8 text-lg">Your itinerary code is <span className="font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded">{bookingCode}</span></p>
                <button onClick={() => navigate('/my-trips')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                    View My Trips
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 md:py-10 flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
                <h1 className="text-3xl font-bold mb-6 text-gray-900">Secure Checkout</h1>
                
                {error && <div className="bg-red-50 text-red-600 p-4 border border-red-200 rounded-xl mb-6 flex items-center"><AlertCircle className="mr-2"/> {error}</div>}

                {step === 1 && (
                    <form onSubmit={handleContinueToPayment} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center"><User className="mr-2 text-blue-500"/> Guest Details</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><label className="block text-sm font-medium mb-1">First Name</label><input required type="text" className="w-full border p-2 rounded-lg" value={guestDetails.firstName} onChange={e=>setGuestDetails({...guestDetails, firstName: e.target.value})} /></div>
                            <div><label className="block text-sm font-medium mb-1">Last Name</label><input required type="text" className="w-full border p-2 rounded-lg" value={guestDetails.lastName} onChange={e=>setGuestDetails({...guestDetails, lastName: e.target.value})} /></div>
                            <div><label className="block text-sm font-medium mb-1">Email</label><input required type="email" className="w-full border p-2 rounded-lg" value={guestDetails.email} onChange={e=>setGuestDetails({...guestDetails, email: e.target.value})} /></div>
                            <div><label className="block text-sm font-medium mb-1">Phone</label><input required type="tel" className="w-full border p-2 rounded-lg" value={guestDetails.phone} onChange={e=>setGuestDetails({...guestDetails, phone: e.target.value})} /></div>
                        </div>
                        <button type="submit" disabled={!quote} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-4 disabled:bg-gray-400">Continue to Payment</button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleConfirmBooking} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center"><CreditCard className="mr-2 text-blue-500"/> Payment Information</h2>
                        <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100 flex justify-between items-center">
                            <span className="font-semibold text-blue-900">Amount to Charge Now:</span>
                            <span className="text-2xl font-bold text-blue-700">Rs. {quote?.dueNow}</span>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div><label className="block text-sm font-medium mb-1">Card Number (Mock)</label><input required type="text" placeholder="**** **** **** ****" className="w-full border p-3 rounded-lg" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1">Expiry</label><input required type="text" placeholder="MM/YY" className="w-full border p-3 rounded-lg" /></div>
                                <div><label className="block text-sm font-medium mb-1">CVC</label><input required type="text" placeholder="***" className="w-full border p-3 rounded-lg" /></div>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 flex justify-center items-center">
                            {loading ? 'Processing...' : (quote?.dueNow > 0 ? 'Pay & Confirm' : 'Confirm Guarantee')}
                        </button>
                    </form>
                )}
            </div>

            <div className="md:w-1/3">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-6">
                    <h3 className="font-bold text-xl mb-4 text-gray-800">Booking Summary</h3>
                    
                    <div className="flex justify-between text-sm mb-2 text-gray-600"><span>Check-in:</span> <span className="font-semibold">{urlParams.checkIn}</span></div>
                    <div className="flex justify-between text-sm mb-4 text-gray-600"><span>Check-out:</span> <span className="font-semibold">{urlParams.checkOut}</span></div>
                    
                    {quote && (
                        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span>Room Subtotal ({quote.nights} nights)</span> <span>Rs. {Math.round(quote.roomTotal)}</span></div>
                            <div className="flex justify-between"><span>Taxes & Fees</span> <span>Rs. {Math.round(quote.taxesFees)}</span></div>
                            {quote.discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon Discount</span> <span>- Rs. {Math.round(quote.discount)}</span></div>}
                            
                            <div className="border-t border-gray-300 pt-3 flex justify-between font-bold text-lg mt-2">
                                <span>Total</span>
                                <span>Rs. {Math.round(quote.totalAmount)}</span>
                            </div>

                            <div className="bg-white p-3 rounded-lg border mt-4 text-xs space-y-1">
                                <div className="flex justify-between text-blue-800 font-bold"><span>Due Now:</span><span>Rs. {Math.round(quote.dueNow)}</span></div>
                                <div className="flex justify-between text-gray-600"><span>Due at Hotel:</span><span>Rs. {Math.round(quote.dueAtHotel)}</span></div>
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <label className="block text-sm font-medium mb-2 text-gray-700">Promo Code</label>
                            <div className="flex gap-2">
                                <input type="text" value={couponCode} onChange={e=>setCouponCode(e.target.value.toUpperCase())} className="flex-1 border border-gray-300 rounded-lg p-2 uppercase" placeholder="e.g. SUMMER20" />
                                <button onClick={handleApplyCoupon} className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-900 transition text-sm">Apply</button>
                            </div>
                            {couponApplied && <p className="text-green-600 text-xs mt-2 font-medium flex items-center"><CheckCircle size={12} className="mr-1"/> Coupon {couponApplied} applied!</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Checkout;
