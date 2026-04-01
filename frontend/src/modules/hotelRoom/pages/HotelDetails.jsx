import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getHotelDetails } from '../services/bookingApi';
import { Check, Users, Shield, CreditCard, MapPin, Star, Wifi, Waves, Car, Wind, Tv, Dumbbell, Utensils, Briefcase, ArrowLeft, Heart, Share2, Info, ArrowRight, Calendar } from 'lucide-react';

/* ───────── Color palette (from LandingPage) ───────── */
const C = {
    900: '#012A4A', 800: '#013A63', 700: '#01497C', 600: '#014F86',
    500: '#2A6F97', 400: '#2C7DA0', 300: '#468FAF', 200: '#61A5C2',
    100: '#89C2D9', 50: '#A9D6E5',
};

const getAmenityIcon = (am) => {
    const l = am.toLowerCase();
    if (l.includes('wifi') || l.includes('internet')) return <Wifi size={16} className="text-gray-500" />;
    if (l.includes('pool') || l.includes('swim')) return <Waves size={16} className="text-gray-500" />;
    if (l.includes('park')) return <Car size={16} className="text-gray-500" />;
    if (l.includes('ac') || l.includes('air') || l.includes('condition')) return <Wind size={16} className="text-gray-500" />;
    if (l.includes('tv') || l.includes('televis')) return <Tv size={16} className="text-gray-500" />;
    if (l.includes('gym') || l.includes('fit')) return <Dumbbell size={16} className="text-gray-500" />;
    if (l.includes('breakfast') || l.includes('food') || l.includes('dining') || l.includes('restaurant')) return <Utensils size={16} className="text-gray-500" />;
    if (l.includes('business') || l.includes('work')) return <Briefcase size={16} className="text-gray-500" />;
    return <Check size={16} className="text-gray-500" />;
};

const HotelDetails = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = parseInt(searchParams.get('guests')) || 2;

    useEffect(() => {
        getHotelDetails(id, checkIn, checkOut).then(res => setData(res.data)).catch(console.error);
    }, [id, checkIn, checkOut]);

    if (!data) return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-12">
            <div className="max-w-5xl mx-auto w-full px-4 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-80 w-full bg-gray-200 rounded-3xl mb-8"></div>
                <div className="h-10 w-2/3 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    const { hotel, rooms, ratePlans } = data;
    const validCapacityRooms = rooms.filter(r => r.capacity >= guests);

    const handleSelectRate = (roomId, ratePlanId) => {
        const query = new URLSearchParams({ hotelId: id, roomId, ratePlanId, checkIn, checkOut, guests });
        navigate(`/hotels/checkout?${query.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-800">
            {/* Minimal Header */}
            <header style={{ background: C[900] }} className="text-white sticky top-0 z-50 shadow-md">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition" aria-label="Go back">
                            <ArrowLeft size={20} />
                        </button>
                        <div className="text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>StayFlow</div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 pt-6">
                {/* Hero Section */}
                <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-8">
                    <div className="relative rounded-2xl overflow-hidden h-[400px]">
                        <img src={(hotel.images && hotel.images[0]) || 'https://images.unsplash.com/photo-1542314831-c6a4d14d8376?q=80&w=1470&auto=format&fit=crop'} alt={hotel.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        
                        {/* Top action buttons */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button className="p-2.5 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full hover:bg-white transition-transform hover:scale-105 shadow-lg">
                                <Share2 size={18} />
                            </button>
                            <button className="p-2.5 bg-white/90 backdrop-blur-sm text-gray-800 rounded-full hover:bg-white transition-transform hover:scale-105 shadow-lg">
                                <Heart size={18} className="hover:fill-red-500 hover:text-red-500" />
                            </button>
                        </div>

                        {/* Title & Info overlay */}
                        <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className={`px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-extrabold uppercase tracking-widest ${hotel.priceRange === 'luxury' ? 'text-purple-200' : 'text-blue-200'}`}>
                                    {hotel.priceRange || 'Standard'}
                                </span>
                                <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 px-2 py-1 rounded-md">
                                    <span className="font-bold text-yellow-300 text-xs">{hotel.starRating}</span>
                                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                </div>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-md">{hotel.name}</h1>
                            <p className="text-white/90 flex items-center text-sm md:text-base font-medium">
                                <MapPin size={18} className="mr-1.5 text-blue-300" />
                                {hotel.address || hotel.city ? `${hotel.address ? hotel.address+', ' : ''}${hotel.city || ''}` : `${hotel.destination}, Sri Lanka`}
                                <button className="ml-3 text-blue-300 underline font-bold hover:text-white transition">View Map</button>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 px-4 pb-4 text-left">
                        <div className="md:col-span-2">
                            <h3 className="text-xl font-bold mb-3 text-gray-900 border-b pb-2">About this property</h3>
                            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{hotel.description || "No detailed description provided for this property."}</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-4 flex items-center"><Info size={16} className="mr-2 text-blue-600" /> Property Amenities</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {(hotel.amenities || []).length > 0 ? hotel.amenities.map(am => (
                                    <div key={am} className="flex items-center text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded-lg border border-gray-100 shadow-sm shadow-black/5">
                                        {getAmenityIcon(am)} <span className="ml-2">{am}</span>
                                    </div>
                                )) : (
                                    <p className="text-xs text-gray-400 italic">No amenities listed.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Params Context */}
                {checkIn && checkOut && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between text-blue-900 text-sm">
                        <div className="flex items-center gap-4 font-semibold">
                            <span>Your Search:</span>
                            <span className="flex items-center gap-1.5"><Calendar size={16} className="text-blue-500" /> {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5"><Users size={16} className="text-blue-500" /> {guests} Guests</span>
                        </div>
                        <button onClick={() => navigate('/')} className="mt-3 sm:mt-0 px-4 py-2 bg-white text-blue-700 font-bold rounded-lg hover:shadow-md transition">Change Search</button>
                    </div>
                )}

                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center border-b pb-3 border-gray-200">
                    Available Rooms
                </h2>
                
                <div className="space-y-6">
                    {validCapacityRooms.map(room => (
                        <div key={room._id} className={`bg-white border text-left rounded-2xl overflow-hidden shadow-sm flex flex-col lg:flex-row transition ${room.availableCount > 0 ? 'border-gray-200 hover:border-blue-300' : 'border-red-200 opacity-80'}`}>
                            
                            {/* Room Info Side */}
                            <div className="p-6 lg:w-1/3 bg-gray-50 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-gray-200 relative">
                                <div className="absolute top-0 right-0 p-4">
                                    <Users size={20} className="text-blue-400 opacity-20" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2 leading-tight">{room.roomType}</h3>
                                {room.description && <p className="text-sm text-gray-600 mb-4 leading-relaxed">{room.description}</p>}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="text-xs font-bold bg-white text-gray-600 px-2 py-1 rounded border shadow-sm">Room {room.roomNumber || 'TBA'}</span>
                                    {room.floor && <span className="text-xs font-bold bg-white text-gray-600 px-2 py-1 rounded border shadow-sm">Floor {room.floor}</span>}
                                    <span className="text-xs font-bold bg-white text-gray-600 px-2 py-1 rounded border shadow-sm flex items-center gap-1"><Users size={12} className="text-blue-500" /> {room.capacity} Guests</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded shadow-sm ${room.availableCount > 0 ? 'bg-green-100 text-green-800 border-green-200 border' : 'bg-red-100 text-red-800 border-red-200 border'}`}>
                                        {room.availableCount > 0 ? `${room.availableCount} / ${room.totalRooms} Rooms Available` : 'Sold Out for Dates'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-bold">Amenities</p>
                                <div className="flex flex-wrap gap-2">
                                    {(room.amenities || []).map(am => (
                                        <span key={am} className="bg-white px-2 py-0.5 text-[11px] border border-gray-200 rounded font-bold text-gray-700 flex items-center shadow-sm">
                                            {getAmenityIcon(am)} {am}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Rate Plans Side */}
                            <div className="p-6 lg:w-2/3 bg-white">
                                <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-400 mb-4 px-2">Select Your Rate</h4>
                                <div className="space-y-4 px-2">
                                    {ratePlans.map(rp => (
                                        <div key={rp._id} className="border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-center transition-all hover:bg-blue-50/50 hover:border-blue-200 hover:shadow-md group">
                                            <div className="w-full sm:w-auto mb-4 sm:mb-0">
                                                <p className="font-extrabold text-gray-900 text-lg mb-2">{rp.name}</p>
                                                <ul className="text-sm space-y-2">
                                                    {rp.cancellationPolicy?.isRefundable ? 
                                                        <li className="flex items-center text-emerald-700 font-semibold bg-emerald-50 w-max px-2 py-0.5 rounded text-xs border border-emerald-100"><Check size={14} className="mr-1.5" /> Free cancellation (until {rp.cancellationPolicy.freeCancellationDaysPrior} days prior)</li> : 
                                                        <li className="flex items-center text-red-600 font-semibold bg-red-50 w-max px-2 py-0.5 rounded text-xs border border-red-100"><Shield size={14} className="mr-1.5" /> Non-Refundable</li>}
                                                    <li className="flex items-center text-gray-600 font-medium text-xs ml-1"><CreditCard size={14} className="mr-2 text-gray-400" /> {rp.paymentType === 'PAY_NOW' ? 'Pay immediately to secure' : 'Pay later at hotel'}</li>
                                                </ul>
                                            </div>
                                            <div className="w-full sm:w-auto flex flex-col items-center sm:items-end p-4 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                                                <p className="text-3xl font-black text-gray-900 mb-1 flex items-end tracking-tighter">
                                                    <span className="text-lg font-bold text-gray-400 mr-1 mb-1">Rs.</span>
                                                    {Math.round(room.basePrice * rp.priceMultiplier).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-500 font-medium mb-4 uppercase tracking-wider">Per night</p>
                                                <button 
                                                    onClick={() => handleSelectRate(room._id, rp._id)}
                                                    disabled={room.availableCount <= 0}
                                                    className={`pl-6 pr-4 py-2.5 rounded-xl font-bold text-white text-sm transition-all w-full flex items-center justify-between gap-3 ${room.availableCount > 0 ? 'shadow-md group-hover:-translate-y-0.5 hover:opacity-90' : 'opacity-50 cursor-not-allowed'}`}
                                                    style={{ background: room.availableCount > 0 ? `linear-gradient(135deg, ${C[600]}, ${C[500]})` : '#9ca3af' }}
                                                >
                                                    {room.availableCount > 0 ? 'Reserve' : 'Sold Out'} <span className="bg-white/20 p-1 rounded-lg"><ArrowRight size={14} /></span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    {validCapacityRooms.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No rooms found</h3>
                            <p className="text-gray-500 max-w-md mx-auto">We couldn't find any rooms at this property matching your criteria of {guests} guests. Please try selecting a different configuration.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default HotelDetails;
