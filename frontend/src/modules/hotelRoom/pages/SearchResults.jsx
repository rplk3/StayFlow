import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchHotels } from '../services/bookingApi';
import { Star, MapPin } from 'lucide-react';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    const destination = searchParams.get('destination');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const res = await searchHotels({ destination, checkIn, checkOut, guests });
                setHotels(res.data);
            } catch (err) {
                console.error("Failed to fetch hotels", err);
            } finally {
                setLoading(false);
            }
        };
        if (destination) fetchHotels();
    }, [destination, checkIn, checkOut, guests]);

    if (loading) return <div className="p-8 text-center text-gray-500">Searching available hotels...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {hotels.length} properties found in {destination}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map(hotel => (
                    <div key={hotel._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all cursor-pointer" 
                         onClick={() => navigate(`/hotels/${hotel._id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)}>
                        <img 
                            src={hotel.images[0] || 'https://via.placeholder.com/400x250?text=No+Image'} 
                            alt={hotel.name} 
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-gray-900">{hotel.name}</h3>
                                <div className="flex items-center bg-yellow-100 px-2 py-1 rounded text-yellow-800 text-sm font-semibold">
                                    <Star size={14} className="mr-1 fill-current" /> {hotel.starRating}
                                </div>
                            </div>
                            <p className="text-gray-500 flex items-center text-sm mb-4">
                                <MapPin size={14} className="mr-1" /> {hotel.destination}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {hotel.amenities.slice(0, 3).map((am, i) => (
                                    <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">{am}</span>
                                ))}
                            </div>
                            <button className="w-full py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                                View Rooms
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {hotels.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl">
                    <h3 className="text-xl text-gray-600">No hotels found matching your criteria.</h3>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
