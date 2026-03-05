import React, { useState } from 'react';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';

export const PaymentForm = ({ onPay, isProcessing, total }) => {
    const [formData, setFormData] = useState({
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        billingAddress: ''
    });

    const [errors, setErrors] = useState({});

    const formatCardNumber = (value) => {
        // Remove all non-digits
        const v = value.replace(/\D/g, '');
        // Limit to 16 digits
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value.replace(/\D/g, ''); // fallback
        }
    };

    const handleCardNumberChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const limitedValue = rawValue.substring(0, 16);

        let formattedValue = '';
        for (let i = 0; i < limitedValue.length; i++) {
            if (i > 0 && i % 4 === 0) formattedValue += ' ';
            formattedValue += limitedValue[i];
        }

        setFormData(prev => ({ ...prev, cardNumber: formattedValue }));
        if (limitedValue.length === 16) {
            setErrors(prev => ({ ...prev, cardNumber: null }));
        }
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.substring(0, 4);

        // Auto-correct month if typing something like 13 -> 12
        if (value.length >= 2) {
            const month = parseInt(value.substring(0, 2), 10);
            if (month > 12) {
                value = '12' + value.substring(2);
            } else if (month === 0 && value.length >= 2 && value.substring(0, 2) === '00') {
                value = '01' + value.substring(2);
            }
        }

        let formattedValue = value;
        if (value.length > 2) {
            formattedValue = value.substring(0, 2) + '/' + value.substring(2);
        } else if (value.length === 2 && formData.expiryDate.length === 3) {
            // Handle backspace properly if they delete the slash
            formattedValue = value.substring(0, 1);
        }

        setFormData(prev => ({ ...prev, expiryDate: formattedValue }));
        if (formattedValue.length === 5) {
            setErrors(prev => ({ ...prev, expiryDate: null }));
        }
    };

    const handleCvcChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.substring(0, 3);
        setFormData(prev => ({ ...prev, cvc: value }));
        if (value.length === 3) {
            setErrors(prev => ({ ...prev, cvc: null }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Quick Validation
        let newErrors = {};
        if (formData.cardNumber.replace(/\D/g, '').length !== 16) {
            newErrors.cardNumber = 'Card number must be 16 digits';
        }
        if (formData.expiryDate.length !== 5) {
            newErrors.expiryDate = 'Invalid expiry date';
        } else {
            // Validate it's not in the past
            const [month, year] = formData.expiryDate.split('/');
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;
            if (parseInt(year, 10) < currentYear || (parseInt(year, 10) === currentYear && parseInt(month, 10) < currentMonth)) {
                newErrors.expiryDate = 'Card has expired';
            }
        }
        if (formData.cvc.length !== 3) {
            newErrors.cvc = 'CVC must be 3 digits';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        onPay(formData);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 bg">How do you want to pay?</h2>
            </div>

            <div className="mb-8 bg-blue-50 border border-blue-200 rounded p-4 flex items-start">
                <div className="bg-white p-1 rounded border border-gray-300 mr-3 mt-1 shadow-sm">
                    <CreditCard className="w-5 h-5 text-[#003B95]" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900">Credit/Debit Card</h3>
                    <p className="text-sm text-gray-600">Safe money transfer using your bank account. Safe payment online. Credit card needed.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Cardholder's Name *</label>
                    <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95] outline-none"
                        placeholder="John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Card Number *</label>
                    <div className="relative">
                        <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleCardNumberChange}
                            required
                            className={`w-full px-4 py-2 border ${errors.cardNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95] outline-none pl-10`}
                            placeholder="0000 0000 0000 0000"
                            maxLength="19"
                        />
                        <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                    {errors.cardNumber && (
                        <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.cardNumber}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Expiry Date *</label>
                        <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleExpiryChange}
                            required
                            className={`w-full px-4 py-2 border ${errors.expiryDate ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95] outline-none`}
                            placeholder="MM/YY"
                            maxLength="5"
                        />
                        {errors.expiryDate && (
                            <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.expiryDate}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">CVC *</label>
                        <input
                            type="text"
                            name="cvc"
                            value={formData.cvc}
                            onChange={handleCvcChange}
                            required
                            className={`w-full px-4 py-2 border ${errors.cvc ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95] outline-none`}
                            placeholder="123"
                            maxLength="3"
                        />
                        {errors.cvc && (
                            <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle className="w-3 h-3 mr-1" /> {errors.cvc}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Billing Address</label>
                    <input
                        type="text"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#003B95] focus:ring-1 focus:ring-[#003B95] outline-none"
                        placeholder="123 Main St, City, Country"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-4 px-4 rounded text-white font-bold text-lg transition-colors flex justify-center items-center ${isProcessing ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#003B95] hover:bg-[#002B70]'}`}
                >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing Payment...
                        </>
                    ) : (
                        <div className="flex items-center">
                            <Lock className="w-5 h-5 mr-2" />
                            Pay US${total}
                        </div>
                    )}
                </button>
            </form>
        </div>
    );
};
