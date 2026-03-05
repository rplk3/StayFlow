import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { CheckCircle2, Download, Home, ArrowRight } from 'lucide-react';
import { generatePDF } from '../utils/generatePDF';

export const SuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { bookingDetails, transactionId } = location.state || {};

    // If user navigated here directly without payment, send them back
    if (!bookingDetails) {
        return <Navigate to="/" />;
    }

    const handleDownloadPDF = () => {
        generatePDF(bookingDetails, transactionId);
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] flex flex-col pt-12 items-center px-4">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-soft border border-gray-200 overflow-hidden text-center">

                {/* Success Header Box */}
                <div className="bg-green-50 py-10 px-8 border-b border-green-100 flex flex-col items-center">
                    <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Your payment was successful. We've sent a confirmation email with details of your stay.
                    </p>
                    <div className="mt-6">
                        <StatusBadge status="PAID" className="text-base px-4 py-1.5" />
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-8 text-left">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Booking Reference</p>
                            <p className="text-xl font-bold text-[#003B95]">{transactionId}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Total Paid</p>
                            <p className="text-xl font-bold text-gray-900">US${bookingDetails.total}</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-gray-900 text-lg mb-3">Hotel Details</h3>
                        <p className="font-semibold">{bookingDetails.hotelName}</p>
                        <p className="text-gray-600 text-sm mb-2">{bookingDetails.location}</p>
                        <p className="text-sm"><span className="font-medium">Dates:</span> {bookingDetails.checkInDate} to {bookingDetails.checkOutDate}</p>
                        <p className="text-sm"><span className="font-medium">Room:</span> {bookingDetails.roomType}</p>
                        <p className="text-sm"><span className="font-medium">Payment Method:</span> {bookingDetails.paymentMethod}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                        <button
                            onClick={handleDownloadPDF}
                            className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003B95] transition-colors"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Download Receipt (PDF)
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded text-white bg-[#003B95] hover:bg-[#002B70] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003B95] shadow-sm transition-colors"
                        >
                            <Home className="w-5 h-5 mr-2" />
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
