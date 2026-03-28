import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import CustomDatePicker from '../components/CustomDatePicker';

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [destination, setDestination] = useState('');
    const [dateRange, setDateRange] = useState({ checkIn: '', checkOut: '' });
    const [guests, setGuests] = useState(2);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (destination.length > 0) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/hotels/suggestions?query=${destination}`);
                    setSuggestions(res.data);
                    setShowSuggestions(true);
                } catch (err) {
                    console.error("Failed to fetch suggestions:", err);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchSuggestions();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [destination]);

    const handleSearch = () => {
        if (!destination || !dateRange.checkIn || !dateRange.checkOut) {
            alert('Please fill out all search fields (Destination, Check-in, Check-out).');
            return;
        }
        const searchParams = new URLSearchParams({
            destination,
            checkIn: dateRange.checkIn,
            checkOut: dateRange.checkOut,
            guests
        });
        navigate(`/hotels/results?${searchParams.toString()}`);
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            {/* Header */}
            <header className="bg-[#003B95] text-white">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="text-2xl font-bold cursor-pointer">StayFlow</div>
                    <div className="flex space-x-4">
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="font-medium text-white">Hi, {user.firstName || 'User'}</span>
                                <button
                                    onClick={() => navigate('/my-trips')}
                                    className="bg-[#0071C2] text-white px-4 py-2 font-medium rounded hover:bg-[#005999] transition border border-[#0071C2]"
                                >
                                    My Account
                                </button>
                                <button
                                    onClick={logout}
                                    className="bg-transparent text-white px-4 py-2 font-medium rounded hover:bg-white hover:text-[#003B95] border border-white transition"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => navigate('/register')} className="bg-white text-[#003B95] px-4 py-2 font-medium rounded hover:bg-gray-100 transition">Register</button>
                                <button onClick={() => navigate('/login')} className="bg-white text-[#003B95] px-4 py-2 font-medium rounded hover:bg-gray-100 transition">Sign in</button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-[#003B95] text-white pt-12 pb-24 px-4 relative">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-5xl font-bold mb-4">Find your next stay</h1>
                    <p className="text-2xl text-gray-200 mb-10">Search low prices on hotels, homes and much more...</p>
                </div>
            </section>

            {/* Search Box (Overlapping Hero) */}
            <div className="max-w-6xl mx-auto px-4 relative -mt-8 mb-12">
                <div className="bg-[#feba02] p-1 rounded border-2 border-[#feba02] flex flex-col md:flex-row gap-1 shadow-lg">
                    {/* Destination */}
                    <div className="flex-1 bg-white p-3 rounded flex items-center shadow-sm relative">
                        <svg className="w-6 h-6 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <div className="w-full relative">
                            <input
                                type="text"
                                placeholder="Where are you going?"
                                className="w-full outline-none text-gray-700"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                onFocus={() => destination.length > 0 && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute left-0 top-full mt-4 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto z-[100]">
                                    {suggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 flex items-center"
                                            onClick={() => {
                                                setDestination(suggestion);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    {/* Dates */}
                    <div className="flex-[2] bg-white rounded flex items-center shadow-sm relative">
                        <CustomDatePicker dateRange={dateRange} setDateRange={setDateRange} />
                    </div>
                    {/* Guests */}
                    <div className="w-full md:w-32 bg-white p-3 rounded flex items-center shadow-sm">
                        <svg className="w-6 h-6 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <input
                            type="number"
                            min="1"
                            className="w-full outline-none text-gray-700"
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value))}
                        />
                    </div>
                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="bg-[#0071C2] hover:bg-[#005999] text-white text-xl font-bold py-3 px-8 rounded transition duration-200"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Main Content Areas */}
            <main className="max-w-6xl mx-auto px-4 pb-20 space-y-12">
                {/* Promotional Banner */}
                <section>
                    <div className="flex items-center justify-between border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Sign in, save money</h3>
                                <p className="text-gray-600">Save 10% or more at participating properties when you create an account.</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button className="bg-[#0071c2] hover:bg-[#005999] text-white px-4 py-2 font-medium rounded transition">Sign in</button>
                            <button className="text-[#0071c2] hover:bg-blue-50 px-4 py-2 font-medium rounded transition border border-[#0071c2]">Register</button>
                        </div>
                    </div>
                </section>

                {/* Event Hall CTA */}
                <section>
                    <div onClick={() => navigate('/event-halls')} className="cursor-pointer group bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 flex items-center justify-between shadow-lg hover:shadow-xl transition-all hover:from-purple-700 hover:to-indigo-800">
                        <div className="text-white">
                            <h2 className="text-2xl font-bold mb-2"> Book an Event Hall</h2>
                            <p className="text-purple-200 text-sm max-w-lg">Host your dream wedding, conference, or birthday. Browse our venues and reserve the perfect hall for your special occasion.</p>
                        </div>
                        <button className="bg-white text-purple-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-purple-50 transition shrink-0 group-hover:scale-105">
                            Browse Halls →
                        </button>
                    </div>
                </section>

                {/* Trending Destinations */}
                <section>
                    <h2 className="text-2xl font-bold mb-4">Trending destinations</h2>
                    <p className="text-gray-600 mb-6">Most popular choices for travelers from your location</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Note: In a real app these would be real images. We'll use placeholders that look decent */}
                        <div className="relative rounded-lg overflow-hidden h-64 group cursor-pointer">
                            <div className="absolute inset-0 bg-gray-300"></div>
                            <img src="https://images.unsplash.com/photo-1544413660-299165566b1d?auto=format&fit=crop&q=80&w=800" alt="Colombo" className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-2xl font-bold flex items-center gap-2">Colombo <span className="text-xl">🇱🇰</span></h3>
                                <p className="text-sm shadow-sm">Popular Choice</p>
                            </div>
                        </div>

                        <div className="relative rounded-lg overflow-hidden h-64 group cursor-pointer">
                            <div className="absolute inset-0 bg-gray-300"></div>
                            <img src="https://images.unsplash.com/photo-1588636402741-dd6052f520b7?auto=format&fit=crop&q=80&w=800" alt="Kandy" className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-2xl font-bold flex items-center gap-2">Kandy <span className="text-xl">🇱🇰</span></h3>
                                <p className="text-sm shadow-sm">Popular Choice</p>
                            </div>
                        </div>

                        <div className="relative rounded-lg overflow-hidden h-64 group cursor-pointer">
                            <div className="absolute inset-0 bg-gray-300"></div>
                            <img src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=800" alt="Galle" className="absolute inset-0 w-full h-full object-cover transition duration-300 group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-2xl font-bold flex items-center gap-2">Galle <span className="text-xl">🇱🇰</span></h3>
                                <p className="text-sm shadow-sm">Popular Choice</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#003B95] text-white py-10 text-center">
                <div className="mb-4">
                    <button className="bg-[#0071C2] hover:bg-[#005999] px-6 py-2 rounded font-medium transition">List your property</button>
                </div>
                <div className="max-w-6xl mx-auto border-t border-blue-800 pt-6 mt-6 flex justify-center space-x-6 text-sm text-gray-300">
                    <a href="#" className="hover:underline">About StayFlow</a>
                    <a href="#" className="hover:underline">Customer Service Help</a>
                    <a href="#" className="hover:underline">Terms & Conditions</a>
                    <a href="#" className="hover:underline">Privacy Statement</a>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                    Copyright © 2026 StayFlow. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
