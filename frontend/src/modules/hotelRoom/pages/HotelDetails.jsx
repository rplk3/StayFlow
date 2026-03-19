import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getHotelDetails } from '../services/bookingApi';
import { Check, Users, Shield, CreditCard } from 'lucide-react';

const HotelDetails = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = parseInt(searchParams.get('guests')) || 2;

    useEffect(() => {
        getHotelDetails(id).then(res => setData(res.data)).catch(console.error);
    }, [id]);

    if (!data) return <div className="p-8 text-center text-gray-500">Loading hotel details...</div>;

    const handleSelectRate = (roomId, ratePlanId) => {
        const query = new URLSearchParams({ hotelId: id, roomId, ratePlanId, checkIn, checkOut, guests });
        navigate(`/hotels/checkout?${query.toString()}`);
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <img src={data.hotel.images[0] || 'https://via.placeholder.com/1200x400'} alt="Hotel" className="w-full h-80 object-cover" />
                <div className="p-8 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.hotel.name}</h1>
                    <p className="text-gray-600 text-lg">{data.hotel.description}</p>
                </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-6">Available Rooms</h2>
            
            <div className="space-y-8">
                {data.rooms.filter(r => r.capacity >= guests).map(room => (
                    <div key={room._id} className="bg-white border text-left border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                        <div className="p-6 md:w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col justify-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{room.roomType}</h3>
                            <p className="text-sm text-gray-500 flex items-center mb-4"><Users size={16} className="mr-2" /> Up to {room.capacity} guests</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {room.amenities.map(am => <span key={am} className="bg-white px-3 py-1 text-xs border border-gray-200 rounded-full font-medium text-gray-600">{am}</span>)}
                            </div>
                        </div>
                        <div className="p-6 md:w-2/3">
                            <h4 className="font-bold text-gray-800 mb-4 px-2">Rate Options</h4>
                            <div className="space-y-3 px-2">
                                {data.ratePlans.map(rp => (
                                    <div key={rp._id} className="border border-gray-200 rounded-xl p-4 flex flex-col lg:flex-row justify-between items-center transition-colors hover:border-blue-400">
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg mb-1">{rp.name}</p>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                {rp.cancellationPolicy.isRefundable ? 
                                                    <li className="flex items-center text-green-600"><Check size={14} className="mr-1" /> Free cancellation before {rp.cancellationPolicy.freeCancellationDaysPrior} days</li> : 
                                                    <li className="flex items-center text-red-500"><Shield size={14} className="mr-1" /> Non-Refundable</li>}
                                                <li className="flex items-center"><CreditCard size={14} className="mr-1" /> {rp.paymentType === 'PAY_NOW' ? 'Pay immediately' : 'Pay at hotel'}</li>
                                            </ul>
                                        </div>
                                        <div className="mt-4 lg:mt-0 flex flex-col items-center">
                                            <p className="text-2xl font-bold text-blue-600 mb-2">Rs. {Math.round(room.basePrice * rp.priceMultiplier)} <span className="text-sm text-gray-500 font-normal">/ night</span></p>
                                            <button 
                                                onClick={() => handleSelectRate(room._id, rp._id)}
                                                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 w-full transition-all"
                                            >
                                                Reserve
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                {data.rooms.filter(r => r.capacity >= guests).length === 0 && (
                    <p className="text-gray-500 text-center py-6 bg-white rounded-xl">No rooms available for {guests} guests.</p>
                )}
            </div>
        </div>
    );
};

export default HotelDetails;
