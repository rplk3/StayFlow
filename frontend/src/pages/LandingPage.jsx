import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { MapPin, ChevronDown, Plus, Minus, Users, Building2, Phone, Mail, Globe, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import CustomDatePicker from '../components/CustomDatePicker';
import heroImg from '../assets/hero_background.png';

/* ───────── Color palette (from coolors) ───────── */
const C = {
    900: '#012A4A', 800: '#013A63', 700: '#01497C', 600: '#014F86',
    500: '#2A6F97', 400: '#2C7DA0', 300: '#468FAF', 200: '#61A5C2',
    100: '#89C2D9', 50: '#A9D6E5',
};

/* ───────── 9 Trending Destinations ───────── */
const destinations = [
    { name: 'Colombo', flag: '🇱🇰', tag: '3 properties', img: 'https://images.unsplash.com/photo-1544413660-299165566b1d?auto=format&fit=crop&q=80&w=800' },
    { name: 'Kandy', flag: '🇱🇰', tag: '2 properties', img: 'https://images.unsplash.com/photo-1562698013-ac13558052cd?q=80&w=810&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Galle', flag: '🇱🇰', tag: '2 properties', img: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=800' },
    { name: 'Nuwara Eliya', flag: '🇱🇰', tag: '1 property', img: 'https://images.unsplash.com/photo-1619974643633-12acfdcedd16?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bnV3YXJhJTIwZWxpeWF8ZW58MHx8MHx8fDA%3D' },
    { name: 'Ella', flag: '🇱🇰', tag: '1 property', img: 'https://images.unsplash.com/photo-1566766189268-ecac9118f2b7?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Udawalawe', flag: '🇱🇰', tag: '1 property', img: 'https://images.unsplash.com/photo-1559038211-894339d3e99f?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Negombo', flag: '🇱🇰', tag: 'Beaches', img: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=800' },
    { name: 'Sigiriya', flag: '🇱🇰', tag: 'Heritage', img: 'https://images.unsplash.com/photo-1588598198321-9735fd52455b?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { name: 'Trincomalee', flag: '🇱🇰', tag: 'Coastal', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800' },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [destination, setDestination] = useState('');
    const [dateRange, setDateRange] = useState({ checkIn: '', checkOut: '' });

    /* ── Guest picker state ── */
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [rooms, setRooms] = useState(1);
    const [showGuestPicker, setShowGuestPicker] = useState(false);
    const guestRef = useRef(null);
    const totalGuests = adults + children;

    /* ── Location suggestions ── */
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Close guest picker on outside click
    useEffect(() => {
        const handler = (e) => { if (guestRef.current && !guestRef.current.contains(e.target)) setShowGuestPicker(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fetch location suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (destination.length > 0) {
                try {
                    const res = await axios.get(`http://localhost:5000/api/hotels/suggestions?query=${destination}`);
                    setSuggestions(res.data);
                    setShowSuggestions(true);
                } catch (err) { console.error("Failed to fetch suggestions:", err); }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };
        const t = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(t);
    }, [destination]);

    const handleSearch = () => {
        if (!destination || !dateRange.checkIn || !dateRange.checkOut) {
            alert('Please fill out all search fields (Destination, Check-in, Check-out).');
            return;
        }
        const searchParams = new URLSearchParams({ destination, checkIn: dateRange.checkIn, checkOut: dateRange.checkOut, guests: totalGuests });
        navigate(`/hotels/results?${searchParams.toString()}`);
    };

    const handleDestinationClick = (name) => {
        navigate(`/hotels/results?destination=${encodeURIComponent(name)}&guests=2`);
    };

    /* ── Counter helper ── */
    const Counter = ({ label, desc, value, setValue, min = 0, max = 30 }) => (
        <div className="flex items-center justify-between py-3">
            <div>
                <div className="font-semibold text-gray-800 text-sm">{label}</div>
                <div className="text-xs text-gray-400">{desc}</div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={() => setValue(Math.max(min, value - 1))}
                    disabled={value <= min}
                    className={`w-8 h-8 rounded-full border flex items-center justify-center transition ${value <= min ? 'border-gray-200 text-gray-300 cursor-not-allowed' : `border-[${C[500]}] text-[${C[500]}] hover:bg-[${C[50]}]`}`}
                    style={value > min ? { borderColor: C[500], color: C[500] } : {}}
                >
                    <Minus size={14} />
                </button>
                <span className="w-6 text-center font-bold text-gray-800">{value}</span>
                <button
                    onClick={() => setValue(Math.min(max, value + 1))}
                    disabled={value >= max}
                    className="w-8 h-8 rounded-full border flex items-center justify-center transition hover:bg-blue-50"
                    style={{ borderColor: C[500], color: C[500] }}
                >
                    <Plus size={14} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            {/* ═══════ Header ═══════ */}
            <header style={{ background: C[800] }} className="text-white">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="text-2xl font-bold cursor-pointer tracking-tight" onClick={() => navigate('/')}>StayFlow</div>
                    <div className="flex space-x-3">
                        {user ? (
                            <div className="flex items-center space-x-3">
                                <span className="font-medium text-white/90 text-sm">Hi, {user.firstName || 'User'}</span>
                                <button onClick={() => navigate('/my-trips')} className="text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-white/10 transition border border-white/30">
                                    My Account
                                </button>
                                <button onClick={logout} className="bg-white/10 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-white hover:text-gray-800 transition">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => navigate('/register')} className="bg-white text-gray-800 px-5 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100 transition">Register</button>
                                <button onClick={() => navigate('/login')} className="border border-white/40 text-white px-5 py-2 text-sm font-semibold rounded-lg hover:bg-white/10 transition">Sign in</button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ═══════ Hero Section with Background Image ═══════ */}
            <section className="relative pt-16 pb-28 px-4">
                {/* Background image */}
                <div className="absolute inset-0 z-0">
                    <img src={heroImg} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${C[900]}ee 0%, ${C[800]}dd 40%, ${C[700]}99 100%)` }}></div>
                </div>
                <div className="max-w-6xl mx-auto relative z-10">
                    <h1 className="text-5xl font-extrabold mb-4 text-white drop-shadow-lg">Find your next stay</h1>
                    <p className="text-xl text-white/80 mb-2 max-w-lg">Search low prices on hotels, homes and much more...</p>
                </div>
            </section>

            {/* ═══════ Search Box (overlapping hero) ═══════ */}
            <div className="max-w-6xl mx-auto px-4 relative -mt-10 mb-12 z-20">
                <div className="bg-white p-2 rounded-2xl shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-2" style={{ boxShadow: `0 20px 60px ${C[900]}33` }}>
                    {/* Destination */}
                    <div className="flex-1 bg-gray-50 p-3 rounded-xl flex items-center relative border border-gray-200 hover:border-blue-300 transition">
                        <MapPin className="w-5 h-5 mr-2 shrink-0" style={{ color: C[500] }} />
                        <div className="w-full relative">
                            <input
                                type="text"
                                placeholder="Where are you going?"
                                className="w-full outline-none text-gray-700 bg-transparent text-sm font-medium placeholder:text-gray-400"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                onFocus={() => destination.length > 0 && setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="absolute left-0 top-full mt-3 w-[320px] bg-white border border-gray-100 rounded-xl shadow-2xl max-h-72 overflow-y-auto z-[100]" style={{ boxShadow: `0 10px 40px ${C[900]}22` }}>
                                    <li className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-50">Popular destinations</li>
                                    {suggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-gray-700 flex items-center gap-3 transition-colors"
                                            onClick={() => { setDestination(suggestion); setShowSuggestions(false); }}
                                        >
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: C[50] }}>
                                                <MapPin size={16} style={{ color: C[600] }} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm text-gray-800">{suggestion}</div>
                                                <div className="text-xs text-gray-400">Sri Lanka</div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="flex-[2] bg-gray-50 rounded-xl flex items-center border border-gray-200 hover:border-blue-300 transition">
                        <CustomDatePicker dateRange={dateRange} setDateRange={setDateRange} />
                    </div>

                    {/* Guest Picker */}
                    <div className="w-full md:w-48 relative" ref={guestRef}>
                        <button
                            onClick={() => setShowGuestPicker(!showGuestPicker)}
                            className="w-full bg-gray-50 p-3 rounded-xl flex items-center justify-between border border-gray-200 hover:border-blue-300 transition h-full"
                        >
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 shrink-0" style={{ color: C[500] }} />
                                <div className="text-left">
                                    <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Guests</div>
                                    <div className="text-sm font-semibold text-gray-800 -mt-0.5">{adults} adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}</div>
                                </div>
                            </div>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showGuestPicker ? 'rotate-180' : ''}`} />
                        </button>
                        {showGuestPicker && (
                            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] p-5" style={{ boxShadow: `0 10px 40px ${C[900]}22` }}>
                                <Counter label="Adults" desc="Age 18+" value={adults} setValue={setAdults} min={1} />
                                <div className="border-t border-gray-100"></div>
                                <Counter label="Children" desc="Age 0-17" value={children} setValue={setChildren} />
                                <div className="border-t border-gray-100"></div>
                                <Counter label="Rooms" desc="Number of rooms" value={rooms} setValue={setRooms} min={1} max={10} />
                                <button
                                    onClick={() => setShowGuestPicker(false)}
                                    className="w-full mt-4 py-2.5 rounded-lg text-white text-sm font-bold transition hover:opacity-90"
                                    style={{ background: C[700] }}
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearch}
                        className="text-white text-sm font-bold py-3 px-8 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                        style={{ background: `linear-gradient(135deg, ${C[700]}, ${C[500]})` }}
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* ═══════ Main Content ═══════ */}
            <main className="max-w-6xl mx-auto px-4 pb-20 space-y-14">
                {/* Promo Banner (only for non-logged-in users) */}
                {!user && (
                    <section>
                        <div className="flex items-center justify-between rounded-2xl p-5 shadow-sm border border-gray-100" style={{ background: `linear-gradient(135deg, ${C[50]}44, white)` }}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: C[50] }}>
                                    <svg className="w-6 h-6" style={{ color: C[600] }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">Sign in, save money</h3>
                                    <p className="text-gray-500 text-sm">Save 10% or more at participating properties when you create an account.</p>
                                </div>
                            </div>
                            <div className="flex space-x-3 shrink-0">
                                <button onClick={() => navigate('/login')} className="text-white px-5 py-2.5 text-sm font-semibold rounded-lg transition hover:opacity-90" style={{ background: C[700] }}>Sign in</button>
                                <button onClick={() => navigate('/register')} className="px-5 py-2.5 text-sm font-semibold rounded-lg transition border hover:bg-blue-50" style={{ color: C[700], borderColor: C[700] }}>Register</button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Event Hall CTA */}
                <section>
                    <div
                        onClick={() => navigate('/event-halls')}
                        className="cursor-pointer group rounded-2xl p-8 flex items-center justify-between shadow-lg hover:shadow-xl transition-all"
                        style={{ background: `linear-gradient(135deg, ${C[800]}, ${C[600]})` }}
                    >
                        <div className="text-white">
                            <h2 className="text-2xl font-bold mb-2"> Book an Event Hall</h2>
                            <p className="text-sm max-w-lg" style={{ color: C[100] }}>
                                Host your dream wedding, conference, or birthday. Browse our venues and reserve the perfect hall for your special occasion.
                            </p>
                        </div>
                        <button
                            className="px-6 py-3 rounded-xl font-bold text-sm transition shrink-0 group-hover:scale-105"
                            style={{ background: 'white', color: C[700] }}
                        >
                            Browse Halls →
                        </button>
                    </div>
                </section>

                {/* ═══════ Trending Destinations (9 cards) ═══════ */}
                <section>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">Trending destinations</h2>
                    <p className="text-gray-500 mb-6 text-sm">Most popular choices for travelers — click to explore hotels</p>

                    {/* Top row: 2 large cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {destinations.slice(0, 2).map((d) => (
                            <div
                                key={d.name}
                                onClick={() => handleDestinationClick(d.name)}
                                className="relative rounded-2xl overflow-hidden h-72 group cursor-pointer"
                            >
                                <img src={d.img} alt={d.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-5 left-5 text-white">
                                    <h3 className="text-3xl font-extrabold flex items-center gap-2 drop-shadow-lg">{d.name} <span className="text-2xl">{d.flag}</span></h3>
                                    <p className="text-sm mt-1 font-medium" style={{ color: C[100] }}>{d.tag}</p>
                                </div>
                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full">
                                    Explore →
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Middle row: 3 medium cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {destinations.slice(2, 5).map((d) => (
                            <div
                                key={d.name}
                                onClick={() => handleDestinationClick(d.name)}
                                className="relative rounded-2xl overflow-hidden h-56 group cursor-pointer"
                            >
                                <img src={d.img} alt={d.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 text-white">
                                    <h3 className="text-xl font-bold flex items-center gap-2 drop-shadow-lg">{d.name} <span className="text-lg">{d.flag}</span></h3>
                                    <p className="text-xs mt-0.5 font-medium" style={{ color: C[100] }}>{d.tag}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom row: 4 smaller cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {destinations.slice(5, 9).map((d) => (
                            <div
                                key={d.name}
                                onClick={() => handleDestinationClick(d.name)}
                                className="relative rounded-2xl overflow-hidden h-48 group cursor-pointer"
                            >
                                <img src={d.img} alt={d.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                                <div className="absolute bottom-3 left-3 text-white">
                                    <h3 className="text-lg font-bold flex items-center gap-1.5 drop-shadow-lg">{d.name} <span className="text-base">{d.flag}</span></h3>
                                    <p className="text-[11px] mt-0.5 font-medium" style={{ color: C[100] }}>{d.tag}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* ═══════ Professional Footer ═══════ */}
            <footer style={{ background: C[900] }} className="text-white">
                <div className="max-w-6xl mx-auto px-4 py-14">
                    {/* Footer Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
                        {/* Brand */}
                        <div className="col-span-2 md:col-span-1">
                            <h3 className="text-xl font-bold mb-4">StayFlow</h3>
                            <p className="text-sm leading-relaxed" style={{ color: C[200] }}>
                                Your trusted partner for finding the perfect stay, anywhere in the world.
                            </p>
                            <div className="flex gap-3 mt-5">
                                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80" style={{ background: C[800] }}><Facebook size={16} /></a>
                                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80" style={{ background: C[800] }}><Instagram size={16} /></a>
                                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80" style={{ background: C[800] }}><Twitter size={16} /></a>
                                <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center transition hover:opacity-80" style={{ background: C[800] }}><Youtube size={16} /></a>
                            </div>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: C[100] }}>Company</h4>
                            <ul className="space-y-2.5 text-sm" style={{ color: C[200] }}>
                                <li><a href="#" className="hover:text-white transition">About StayFlow</a></li>
                                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition">Press & Media</a></li>
                                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition">Investor Relations</a></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: C[100] }}>Support</h4>
                            <ul className="space-y-2.5 text-sm" style={{ color: C[200] }}>
                                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                                <li><a href="#" className="hover:text-white transition">Safety Information</a></li>
                                <li><a href="#" className="hover:text-white transition">Cancellation Options</a></li>
                                <li><a href="#" className="hover:text-white transition">Report a Concern</a></li>
                                <li><a href="#" className="hover:text-white transition">COVID-19 Response</a></li>
                            </ul>
                        </div>

                        {/* Discover */}
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: C[100] }}>Discover</h4>
                            <ul className="space-y-2.5 text-sm" style={{ color: C[200] }}>
                                <li><a href="#" className="hover:text-white transition">Trust & Safety</a></li>
                                <li><a href="#" className="hover:text-white transition">Accessibility</a></li>
                                <li><a href="#" className="hover:text-white transition">Travel Articles</a></li>
                                <li><a href="#" className="hover:text-white transition">Seasonal Deals</a></li>
                                <li><a href="#" className="hover:text-white transition">Gift Cards</a></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="font-bold text-sm uppercase tracking-wider mb-4" style={{ color: C[100] }}>Contact</h4>
                            <ul className="space-y-3 text-sm" style={{ color: C[200] }}>
                                <li className="flex items-center gap-2"><Phone size={14} /> +94 11 234 5678</li>
                                <li className="flex items-center gap-2"><Mail size={14} /> support@stayflow.com</li>
                                <li className="flex items-center gap-2"><Globe size={14} /> www.stayflow.com</li>
                                <li className="flex items-center gap-2"><Building2 size={14} /> Colombo, Sri Lanka</li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center text-xs" style={{ borderColor: C[800], color: C[300] }}>
                        <p>© 2026 StayFlow. All rights reserved.</p>
                        <div className="flex gap-6 mt-3 md:mt-0">
                            <a href="#" className="hover:text-white transition">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition">Terms of Service</a>
                            <a href="#" className="hover:text-white transition">Cookie Settings</a>
                            <a href="#" className="hover:text-white transition">Sitemap</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
