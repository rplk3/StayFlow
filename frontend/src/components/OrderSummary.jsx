import React from 'react';
import { Calendar, MapPin, Users, Star } from 'lucide-react';

export const OrderSummary = ({ bookingDetails }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-[#003B95] p-6 text-white">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold">{bookingDetails.hotelName}</h2>
                        <div className="flex items-center mt-1 text-sm text-blue-100">
                            <MapPin className="w-4 h-4 mr-1" />
                            {bookingDetails.location}
                        </div>
                    </div>
                    <div className="flex">
                        {[...Array(bookingDetails.stars)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-[#FFB700] fill-current" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Your booking details</h3>

                <div className="grid grid-cols-2 gap-4 mb-6 relative">
                    <div className="border-r border-gray-200 pr-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</span>
                        <div className="font-bold text-gray-900 mt-1">{bookingDetails.checkInDate}</div>
                        <div className="text-sm text-gray-500">{bookingDetails.checkInTime}</div>
                    </div>
                    <div className="pl-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-out</span>
                        <div className="font-bold text-gray-900 mt-1">{bookingDetails.checkOutDate}</div>
                        <div className="text-sm text-gray-500">{bookingDetails.checkOutTime}</div>
                    </div>
                </div>

                <div className="mb-6 pt-4 border-t border-gray-200">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total length of stay:</span>
                    <div className="font-semibold text-gray-900 mt-1">{bookingDetails.nights} nights</div>
                </div>

                <div className="mb-6 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">You selected:</h4>
                    <div className="flex justify-between items-start">
                        <div className="text-sm font-medium text-gray-800">{bookingDetails.roomType}</div>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        {bookingDetails.guests} guests
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                    <div className="bg-blue-50 -mx-6 -mb-6 p-6">
                        <h3 className="font-bold text-xl text-gray-900 mb-4">Price details</h3>
                        <div className="flex justify-between mb-2 text-sm text-gray-700">
                            <span>Original price (1 room x {bookingDetails.nights} nights)</span>
                            <span>US${bookingDetails.basePrice}</span>
                        </div>
                        <div className="flex justify-between mb-4 text-sm text-gray-700">
                            <span>Taxes and fees</span>
                            <span>US${bookingDetails.taxes}</span>
                        </div>
                        <div className="flex justify-between items-end pt-4 border-t border-gray-300">
                            <div>
                                <div className="text-2xl font-bold text-gray-900">Total</div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-[#003B95]">US${bookingDetails.total}</div>
                                <div className="text-xs text-gray-500 mt-1">Includes taxes and charges</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
