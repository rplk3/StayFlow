import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = 'http://localhost:5000/api/payments';

const PaymentGateway = ({ bookingId, bookingType, userId, amount, taxAmount, serviceCharge, totalAmount, onSuccess, onFailure }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null); // { success, payment, invoice, message }

    const inputClass = "w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-gray-50 transition-all";

    const handlePay = async () => {
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
                cardDetails: { last4: cardNumber.slice(-4) }
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
                <div className={`rounded-2xl border p-8 text-center ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                        {result.success ?
                            <CheckCircle size={32} className="text-green-600" /> :
                            <XCircle size={32} className="text-red-600" />
                        }
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                        {result.success ? 'Payment Successful!' : 'Payment Failed'}
                    </h3>
                    <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                        {result.message}
                    </p>
                    {result.success && result.payment && (
                        <div className="mt-4 bg-white rounded-xl p-4 border border-green-200 text-left text-sm">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500">Transaction Ref</span>
                                <span className="font-mono font-semibold text-gray-800">{result.payment.transactionReference}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500">Amount Paid</span>
                                <span className="font-bold text-green-700">Rs. {result.payment.totalAmount?.toLocaleString()}</span>
                            </div>
                            {result.invoice && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Invoice #</span>
                                    <span className="font-mono font-semibold text-gray-800">{result.invoice.invoiceNumber}</span>
                                </div>
                            )}
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 mb-3">Payment Summary</h4>
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
                    <div className="border-t border-blue-200 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-blue-900">Total Payable</span>
                            <span className="text-2xl font-extrabold text-blue-700">Rs. {(totalAmount || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center gap-3">
                    <CreditCard size={20} className="text-white" />
                    <h2 className="text-lg font-bold text-white">Payment Information</h2>
                    <span className="ml-auto bg-white bg-opacity-20 text-white text-xs px-3 py-1 rounded-full font-semibold">SANDBOX</span>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Card Number</label>
                        <input
                            type="text"
                            placeholder="4111 1111 1111 1111"
                            className={inputClass}
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                            maxLength={19}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expiry Date</label>
                            <input
                                type="text"
                                placeholder="MM / YY"
                                className={inputClass}
                                value={expiry}
                                onChange={e => setExpiry(e.target.value)}
                                maxLength={7}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">CVC</label>
                            <input
                                type="text"
                                placeholder="123"
                                className={inputClass}
                                value={cvc}
                                onChange={e => setCvc(e.target.value)}
                                maxLength={4}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                        <Lock size={14} /> Sandbox mode — no real charges will be applied
                    </div>
                </div>
            </div>

            {/* Pay Button */}
            <button
                onClick={handlePay}
                disabled={processing || !cardNumber || !expiry || !cvc}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5"
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
