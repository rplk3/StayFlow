import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderSummary } from '../components/OrderSummary';
import { PaymentForm } from '../components/PaymentForm';

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock booking details
    const bookingDetails = {
        hotelName: 'Grand Plaza Hotel & Spa',
        stars: 5,
        location: '123 Luxury Avenue, Beverly Hills, CA',
        checkInDate: 'Fri, 24 May 2026',
        checkOutDate: 'Sun, 26 May 2026',
        checkInTime: 'From 15:00',
        checkOutTime: 'Until 11:00',
        nights: 2,
        roomType: 'Deluxe King Room with City View',
        guests: 2,
        basePrice: '450.00',
        taxes: '67.50',
        total: '517.50'
    };

    const handlePayment = (formData) => {
        setIsProcessing(true);

        // Simulate API call for 2 seconds
        setTimeout(() => {
            setIsProcessing(false);
            // Navigate to success page with booking data state
            navigate('/success', {
                state: {
                    bookingDetails: {
                        ...bookingDetails,
                        paymentMethod: `Credit Card ending in ${formData.cardNumber.slice(-4) || '1234'}`
                    },
                    transactionId: 'HB-' + Math.floor(Math.random() * 10000000)
                }
            });
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            {/* Header */}
            <header className="bg-[#003B95] text-white py-4 shadow-md">
                <div className="container mx-auto px-4">
                    <h1 className="text-2xl font-bold">Booking.com Prototype</h1>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Order Summary */}
                    <div className="w-full lg:w-1/3 order-2 lg:order-1">
                        <OrderSummary bookingDetails={bookingDetails} />
                    </div>

                    {/* Right Column - Payment Form */}
                    <div className="w-full lg:w-2/3 order-1 lg:order-2">
                        <PaymentForm
                            onPay={handlePayment}
                            isProcessing={isProcessing}
                            total={bookingDetails.total}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};
