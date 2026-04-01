import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users } from 'lucide-react';

import CustomDatePicker from '../../../components/CustomDatePicker';

const SearchPage = () => {
    const navigate = useNavigate();
    const [destination, setDestination] = useState('');
    const [dateRange, setDateRange] = useState({ checkIn: '', checkOut: '' });
    const [guests, setGuests] = useState(2);

    const handleSearch = (e) => {
        e.preventDefault();
        const searchParams = new URLSearchParams({ 
            destination, 
            checkIn: dateRange.checkIn, 
            checkOut: dateRange.checkOut, 
            guests 
        });
        navigate(`/hotels/search?${searchParams.toString()}`);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 mt-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Find Your Perfect Stay</h1>
            
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4 items-center border border-gray-100">
                <div className="flex-1 w-full relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        required
                        type="text" 
                        placeholder="Where are you going?" 
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="flex-[2] w-full relative">
                    <CustomDatePicker dateRange={dateRange} setDateRange={setDateRange} />
                </div>

                <div className="w-full md:w-32 relative">
                    <Users className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input 
                        required
                        type="number"
                        min="1"
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value))}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                    <Search size={20} /> Search
                </button>
            </form>
        </div>
    );
};

export default SearchPage;

