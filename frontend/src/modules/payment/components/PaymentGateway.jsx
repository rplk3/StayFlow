import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, XCircle, Loader2, AlertCircle, ShieldCheck, Calendar, Hash, Download, Mail, UserPlus } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';

const API = 'http://localhost:5000/api/payments';

/* ───────── Color palette (matching LandingPage) ───────── */
const C = {
    900: '#012A4A', 800: '#013A63', 700: '#01497C', 600: '#014F86',
    500: '#2A6F97', 400: '#2C7DA0', 300: '#468FAF', 200: '#61A5C2',
    100: '#89C2D9', 50: '#A9D6E5',
};

const PaymentGateway = ({ bookingId, bookingType, userId, amount, taxAmount, serviceCharge, totalAmount, onSuccess, onFailure, guestDetails, bookingCode, checkIn, checkOut }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);

     // ── Generate Invoice PDF ──
    const generateInvoicePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

    // Header bar
        doc.setFillColor(1, 42, 74); // C[900]
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setFillColor(1, 73, 124); // C[700]
        doc.rect(0, 40, pageWidth, 4, 'F');

        // Logo/Brand
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('StayFlow', 20, 25);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Booking Invoice', 20, 33);

        // Invoice details top right
        doc.setFontSize(9);
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 20, 20, { align: 'right' });
        if (result?.invoice?.invoiceNumber) {
            doc.text(`Invoice #: ${result.invoice.invoiceNumber}`, pageWidth - 20, 27, { align: 'right' });
        }
        if (result?.payment?.transactionReference) {
            doc.text(`Ref: ${result.payment.transactionReference}`, pageWidth - 20, 34, { align: 'right' });
        }

        let y = 58;

        // Guest Info section
        doc.setTextColor(1, 42, 74);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Guest Information', 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        if (guestDetails?.firstName) doc.text(`Name: ${guestDetails.firstName} ${guestDetails.lastName || ''}`, 20, y); y += 6;
        if (guestDetails?.email) doc.text(`Email: ${guestDetails.email}`, 20, y); y += 6;
        if (guestDetails?.phone) doc.text(`Phone: ${guestDetails.phone}`, 20, y); y += 6;

        // Booking details
        y += 6;
        doc.setTextColor(1, 42, 74);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Booking Details', 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        if (bookingCode) doc.text(`Booking Code: ${bookingCode}`, 20, y); y += 6;
        doc.text(`Booking Type: ${bookingType === 'event' ? 'Event Hall' : 'Hotel Room'}`, 20, y); y += 6;
        if (checkIn) doc.text(`Check-in: ${checkIn}`, 20, y); y += 6;
        if (checkOut) doc.text(`Check-out: ${checkOut}`, 20, y); y += 6;

        // Payment breakdown table
        y += 8;
        doc.setTextColor(1, 42, 74);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Breakdown', 20, y);
        y += 10;

        // Table header
        doc.setFillColor(1, 73, 124);
        doc.rect(20, y - 5, pageWidth - 40, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Description', 25, y + 1);
        doc.text('Amount (Rs.)', pageWidth - 25, y + 1, { align: 'right' });
        y += 12;

        // Table rows
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'normal');
        const rows = [];
        rows.push([bookingType === 'event' ? 'Hall Charge' : 'Room Charge', (amount || 0).toLocaleString()]);
        if (taxAmount > 0) rows.push(['Taxes & Fees', taxAmount.toLocaleString()]);
        if (serviceCharge > 0) rows.push(['Service Charge (Transport)', serviceCharge.toLocaleString()]);

        rows.forEach(([label, val], i) => {
            if (i % 2 === 0) {
                doc.setFillColor(245, 247, 250);
                doc.rect(20, y - 5, pageWidth - 40, 9, 'F');
            }
            doc.text(label, 25, y);
            doc.text(val, pageWidth - 25, y, { align: 'right' });
            y += 9;
        });

        // Total
        doc.setFillColor(1, 42, 74);
        doc.rect(20, y - 3, pageWidth - 40, 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Total Paid', 25, y + 5);
        doc.text(`Rs. ${(totalAmount || 0).toLocaleString()}`, pageWidth - 25, y + 5, { align: 'right' });
        y += 22;

        // Status badge
        doc.setFillColor(220, 252, 231);
        doc.roundedRect(20, y, 60, 10, 3, 3, 'F');
        doc.setTextColor(22, 101, 52);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('PAYMENT SUCCESSFUL', 25, y + 7);

        // Footer
        const footerY = doc.internal.pageSize.getHeight() - 20;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('StayFlow | www.stayflow.com | support@stayflow.com | +94 11 234 5678', pageWidth / 2, footerY, { align: 'center' });
        doc.text('Thank you for your booking!', pageWidth / 2, footerY + 5, { align: 'center' });

        // Save
        const fileName = `StayFlow_Invoice_${result?.invoice?.invoiceNumber || bookingCode || 'receipt'}.pdf`;
        doc.save(fileName);
    };

    // Validation errors
    const [cardError, setCardError] = useState('');
    const [expiryError, setExpiryError] = useState('');
    const [cvcError, setCvcError] = useState('');

    const inputClass = "w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent outline-none text-sm bg-gray-50 transition-all";
    const errorInputClass = "w-full px-4 py-3.5 border border-red-400 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none text-sm bg-red-50/50 transition-all";

    // ── Format card number with spaces (4-4-4-4) ──
    const formatCardNumber = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    // ── Format expiry as MM / YY ──
    const formatExpiry = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) {
            return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
        }
        return digits;
    };

    // ── Validate card number (must be 16 digits) ──
    const validateCard = (value) => {
        const digits = value.replace(/\D/g, '');
        if (!digits) { setCardError(''); return true; }
        if (digits.length !== 16) {
            setCardError('Card number must be 16 digits');
            return false;
        }
        setCardError('');
        return true;
    };

    // ── Validate expiry (MM/YY, cannot be expired) ──
    const validateExpiry = (value) => {
        const digits = value.replace(/\D/g, '');
        if (!digits) { setExpiryError(''); return true; }
        if (digits.length < 4) {
            setExpiryError('Enter a valid expiry date (MM / YY)');
            return false;
        }
        const month = parseInt(digits.slice(0, 2), 10);
        const year = parseInt(digits.slice(2, 4), 10) + 2000;

        if (month < 1 || month > 12) {
            setExpiryError('Invalid month (01-12)');
            return false;
        }

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            setExpiryError('This card has expired');
            return false;
        }
        setExpiryError('');
        return true;
    };

    // ── Validate CVC (3 or 4 digits) ──
    const validateCvc = (value) => {
        const digits = value.replace(/\D/g, '');
        if (!digits) { setCvcError(''); return true; }
        if (digits.length < 3) {
            setCvcError('CVC must be 3 or 4 digits');
            return false;
        }
        setCvcError('');
        return true;
    };

    // ── Detect card type from number ──
    const getCardType = () => {
        const digits = cardNumber.replace(/\D/g, '');
        if (digits.startsWith('4')) return 'visa';
        if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
        if (digits.startsWith('3')) return 'amex';
        return null;
    };

    const cardType = getCardType();

    const handlePay = async () => {
        // Validate all fields before payment
        const isCardValid = validateCard(cardNumber);
        const isExpiryValid = validateExpiry(expiry);
        const isCvcValid = validateCvc(cvc);
        if (!isCardValid || !isExpiryValid || !isCvcValid) return;

        setProcessing(true);
        setResult(null);
        try {
            const res = await axios.post(`${API}/process`, {
                bookingId,
                bookingType,
                userId,
                amount,
                taxAmount,
                serviceCharge,
                totalAmount,
                paymentMethod: 'sandbox',
                cardDetails: { last4: cardNumber.replace(/\D/g, '').slice(-4) }
            });

            setResult(res.data);
            if (res.data.success) {
                onSuccess?.(res.data);
            } else {
                onFailure?.(res.data);
            }
        } catch (err) {
            const failResult = { success: false, message: err.response?.data?.message || 'Payment processing error' };
            setResult(failResult);
            onFailure?.(failResult);
        } finally {
            setProcessing(false);
        }
    };

    // Show result state
    if (result) {
        return (
            <div className="space-y-6">
                <div className={`rounded-2xl border p-8 text-center ${result.success ? 'border-green-200' : 'bg-red-50 border-red-200'}`} style={result.success ? { background: `${C[50]}33`, borderColor: `${C[200]}66` } : {}}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.success ? '' : 'bg-red-100'}`} style={result.success ? { background: `${C[100]}66` } : {}}>
                        {result.success ?
                            <CheckCircle size={32} style={{ color: C[700] }} /> :
                            <XCircle size={32} className="text-red-600" />
                        }
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${result.success ? '' : 'text-red-800'}`} style={result.success ? { color: C[800] } : {}}>
                        {result.success ? 'Payment Successful!' : 'Payment Failed'}
                    </h3>
                    <p className={`text-sm ${result.success ? '' : 'text-red-600'}`} style={result.success ? { color: C[500] } : {}}>
                        {result.message}
                    </p>
                    {result.success && result.payment && (
                        <div className="mt-4 bg-white rounded-xl p-4 border text-left text-sm" style={{ borderColor: `${C[200]}44` }}>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500">Transaction Ref</span>
                                <span className="font-mono font-semibold text-gray-800">{result.payment.transactionReference}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500">Amount Paid</span>
                                <span className="font-bold" style={{ color: C[700] }}>Rs. {result.payment.totalAmount?.toLocaleString()}</span>
                            </div>
                            {result.invoice && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Invoice #</span>
                                    <span className="font-mono font-semibold text-gray-800">{result.invoice.invoiceNumber}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Email confirmation message ── */}
                    {result.success && (
                        <div className="mt-5 space-y-3">
                            <div className="flex items-center gap-3 p-4 rounded-xl border text-left" style={{ background: `${C[50]}22`, borderColor: `${C[200]}33` }}>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C[100]}44` }}>
                                    <Mail size={18} style={{ color: C[700] }} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">Confirmation email sent!</p>
                                    <p className="text-xs text-gray-500">A booking confirmation has been sent to {guestDetails?.email || 'your email'}. Please check your inbox.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 text-left">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-amber-50">
                                    <UserPlus size={18} className="text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">View booking in your profile</p>
                                    <p className="text-xs text-gray-500">Sign in or create an account with <strong>{guestDetails?.email || 'your email'}</strong> to view and manage your booking details anytime.</p>
                                </div>
                            </div>

                            {/* Download Invoice Button */}
                            <button
                                onClick={generateInvoicePDF}
                                className="w-full flex items-center justify-center gap-2 mt-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 hover:-translate-y-0.5 text-white"
                                style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`, boxShadow: `0 4px 14px ${C[500]}44` }}
                            >
                                <Download size={18} />
                                Download Invoice PDF
                            </button>
                        </div>
                    )}

                    {!result.success && (
                        <button
                            onClick={() => setResult(null)}
                            className="mt-4 px-6 py-2.5 bg-white border border-red-200 text-red-700 rounded-xl font-semibold text-sm hover:bg-red-50 transition"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Payment Summary */}
            <div className="p-5 rounded-xl border" style={{ background: `linear-gradient(135deg, ${C[50]}33, white)`, borderColor: `${C[100]}66` }}>
                <h4 className="text-sm font-bold mb-3" style={{ color: C[800] }}>Payment Summary</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>{bookingType === 'event' ? 'Hall Charge' : 'Room Charge'}</span>
                        <span className="font-semibold">Rs. {(amount || 0).toLocaleString()}</span>
                    </div>
                    {taxAmount > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>Taxes</span>
                            <span className="font-semibold">Rs. {taxAmount.toLocaleString()}</span>
                        </div>
                    )}
                    {serviceCharge > 0 && (
                        <div className="flex justify-between text-gray-600">
                            <span>Service Charge</span>
                            <span className="font-semibold">Rs. {serviceCharge.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="pt-2 mt-2" style={{ borderTop: `1px solid ${C[200]}44` }}>
                        <div className="flex justify-between items-center">
                            <span className="font-bold" style={{ color: C[900] }}>Total Payable</span>
                            <span className="text-2xl font-extrabold" style={{ color: C[700] }}>Rs. {(totalAmount || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})` }}>
                    <CreditCard size={20} className="text-white" />
                    <h2 className="text-lg font-bold text-white">Payment Information</h2>
                    <span className="ml-auto text-white text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.2)' }}>SANDBOX</span>
                </div>
                <div className="p-6 space-y-5">
                    {/* Card Number */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Card Number</label>
                        {cardError && (
                            <div className="flex items-center gap-1.5 mb-2 text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                <AlertCircle size={14} />
                                {cardError}
                            </div>
                        )}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="4111 1111 1111 1111"
                                className={cardError ? errorInputClass : inputClass}
                                style={!cardError ? { '--tw-ring-color': C[500] } : {}}
                                value={cardNumber}
                                onChange={e => {
                                    const formatted = formatCardNumber(e.target.value);
                                    setCardNumber(formatted);
                                    if (cardError) validateCard(formatted);
                                }}
                                onBlur={() => validateCard(cardNumber)}
                                maxLength={19}
                            />
                            {/* Card type icon */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {cardType === 'visa' && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">VISA</span>
                                )}
                                {cardType === 'mastercard' && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">MC</span>
                                )}
                                {cardType === 'amex' && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">AMEX</span>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <CreditCard size={11} /> {cardNumber.replace(/\D/g, '').length}/16 digits
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Expiry Date */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry Date</label>
                            {expiryError && (
                                <div className="flex items-center gap-1.5 mb-2 text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    <AlertCircle size={14} />
                                    {expiryError}
                                </div>
                            )}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="MM / YY"
                                    className={expiryError ? errorInputClass : inputClass}
                                    style={!expiryError ? { '--tw-ring-color': C[500] } : {}}
                                    value={expiry}
                                    onChange={e => {
                                        const formatted = formatExpiry(e.target.value);
                                        setExpiry(formatted);
                                        if (expiryError) validateExpiry(formatted);
                                    }}
                                    onBlur={() => validateExpiry(expiry)}
                                    maxLength={7}
                                />
                                <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>

                        {/* CVC */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">CVC</label>
                            {cvcError && (
                                <div className="flex items-center gap-1.5 mb-2 text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    <AlertCircle size={14} />
                                    {cvcError}
                                </div>
                            )}
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="•••"
                                    className={cvcError ? errorInputClass : inputClass}
                                    style={!cvcError ? { '--tw-ring-color': C[500] } : {}}
                                    value={cvc}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                        setCvc(val);
                                        if (cvcError) validateCvc(val);
                                    }}
                                    onBlur={() => validateCvc(cvc)}
                                    maxLength={4}
                                />
                                <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    {/* Security notice */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <ShieldCheck size={16} style={{ color: C[400] }} />
                        <span>Your card details are secure. Sandbox mode — no real charges will be applied.</span>
                    </div>
                </div>
            </div>

            {/* Pay Button */}
            <button
                onClick={handlePay}
                disabled={processing || !cardNumber || !expiry || !cvc}
                className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})`, boxShadow: `0 4px 14px ${C[500]}44` }}
            >
                {processing ? (
                    <><Loader2 size={20} className="animate-spin" /> Processing Payment...</>
                ) : (
                    <><Lock size={20} /> Pay Rs. {(totalAmount || 0).toLocaleString()}</>
                )}
            </button>
        </div>
    );
};

export default PaymentGateway;



