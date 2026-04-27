import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchHotels } from '../services/bookingApi';
import { Star, MapPin, Wifi, Car, Wind, Waves, Tv, Dumbbell, Utensils, Briefcase, Check, Filter, Search, Calendar, Users, ChevronRight, ArrowUpDown, Map, X, GitCompareArrows, RotateCcw, ArrowLeft } from 'lucide-react';

/* ───────── Global Color System ───────── */
const C = {
    // Semantic Tokens
    primary: '#0F2D52', action: '#1D6FE8', accent: '#F59E0B',
    success: '#16A34A', alert: '#C0392B', bg: '#F4F6F9',
    card: '#FFFFFF', text: '#1A1A2E',

    // Legacy mapping to prevent breakages
    900: '#0F2D52', 800: '#0F2D52', 700: '#0F2D52', 600: '#1D6FE8',
    500: '#1D6FE8', 400: '#1D6FE8', 300: '#60A5FA', 200: '#BFDBFE',
    100: '#DBEAFE', 50: '#F0F9FF',
};

const getAmenityIcon = (am) => {
    const l = am.toLowerCase();
    if (l.includes('wifi') || l.includes('internet')) return <Wifi size={14} className="mr-1.5 opacity-70" />;
    if (l.includes('pool') || l.includes('swim')) return <Waves size={14} className="mr-1.5 opacity-70" />;
    if (l.includes('park')) return <Car size={14} className="mr-1.5 opacity-70" />;
    if (l.includes('ac') || l.includes('air') || l.includes('condition')) return <Wind size={14} className="mr-1.5 opacity-70" />;
    if (l.includes('tv') || l.includes('televis')) return <Tv size={14} className="mr-1.5 opacity-70" />;
    if (l.includes('gym') || l.includes('fit')) return <Dumbbell size={14} className="mr-1.5 opacity-70" />;
    if (l.includes('breakfast') || l.includes('food') || l.includes('dining') || l.includes('restaurant')) return <Utensils size={14} className="mr-1.5 opacity-70" />;
    if (l.includes('business') || l.includes('work')) return <Briefcase size={14} className="mr-1.5 opacity-70" />;
    return <Check size={14} className="mr-1.5 opacity-70" />;
};

/* Helper: get lowest room price for a hotel */
const getMinPrice = (hotel) => {
    if (!hotel.rooms || hotel.rooms.length === 0) return null;
    return Math.min(...hotel.rooms.map(r => r.basePrice || Infinity));
};

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('recommended');
    const [showMap, setShowMap] = useState(false);
    const [compareList, setCompareList] = useState([]);
    const [showCompare, setShowCompare] = useState(false);

    // Filter state
    const [nameFilter, setNameFilter] = useState('');
    const [starFilters, setStarFilters] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 50000]);
    const [amenityFilters, setAmenityFilters] = useState([]);

    // Derive max price and unique amenities from loaded hotels
    const maxPrice = useMemo(() => {
        if (hotels.length === 0) return 50000;
        const prices = hotels.map(h => getMinPrice(h)).filter(p => p !== null && p !== Infinity);
        return prices.length > 0 ? Math.max(...prices) + 1000 : 50000;
    }, [hotels]);

    const allAmenities = useMemo(() => {
        const set = new Set();
        hotels.forEach(h => (h.amenities || []).forEach(a => set.add(a)));
        return [...set].sort();
    }, [hotels]);

    // Initialize price slider max when hotels load
    useEffect(() => { if (hotels.length > 0) setPriceRange([0, maxPrice]); }, [maxPrice]);

    const toggleStar = (s) => setStarFilters(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    const toggleAmenity = (a) => setAmenityFilters(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
    const toggleCompare = (id) => setCompareList(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev);
    const clearFilters = () => { setNameFilter(''); setStarFilters([]); setPriceRange([0, maxPrice]); setAmenityFilters([]); };

    // Filter + sort
    const filteredSorted = useMemo(() => {
        let list = [...hotels];
        if (nameFilter) list = list.filter(h => h.name.toLowerCase().includes(nameFilter.toLowerCase()));
        if (starFilters.length > 0) list = list.filter(h => starFilters.some(s => (h.starRating || 0) >= s));
        list = list.filter(h => { const p = getMinPrice(h); return p === null || (p >= priceRange[0] && p <= priceRange[1]); });
        if (amenityFilters.length > 0) list = list.filter(h => amenityFilters.every(a => (h.amenities || []).includes(a)));
        list.sort((a, b) => {
            switch (sortBy) {
                case 'price-low': return (getMinPrice(a) || 0) - (getMinPrice(b) || 0);
                case 'price-high': return (getMinPrice(b) || 0) - (getMinPrice(a) || 0);
                case 'star-rating': return (b.starRating || 0) - (a.starRating || 0);
                default: return 0;
            }
        });
        return list;
    }, [hotels, nameFilter, starFilters, priceRange, amenityFilters, sortBy]);

    const compareHotels = hotels.filter(h => compareList.includes(h._id));

    const destination = searchParams.get('destination') || 'Unspecified Location';
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests') || 2;

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const res = await searchHotels({ destination: searchParams.get('destination'), checkIn, checkOut, guests });
                setHotels(res.data);
            } catch (err) {
                console.error("Failed to fetch hotels", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, [searchParams, destination, checkIn, checkOut, guests]);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-12">
            {/* Minimal Header */}
            <header style={{ background: C[900] }} className="text-white sticky top-0 z-50 shadow-md">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>StayFlow</div>
                    <div className="flex gap-4 text-sm font-medium">
                        <button onClick={() => navigate('/my-trips')} className="hover:text-blue-200 transition">My Trips</button>
                    </div>
                </div>
            </header>

            {/* Search Bar Readonly Summary */}
            <div style={{ background: C[800] }} className="text-white pb-10 pt-4">
                <div className="max-w-6xl mx-auto px-4">
                    <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white transition-colors mb-4 w-max group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>
                    <div className="flex flex-wrap items-center gap-4 bg-white/10 p-3 rounded-xl border border-white/20 backdrop-blur-md w-max max-w-full">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                            <MapPin size={16} style={{ color: C[200] }} />
                            <span className="font-semibold text-sm">{destination}</span>
                        </div>
                        {checkIn && checkOut && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                                <Calendar size={16} style={{ color: C[200] }} />
                                <span className="font-semibold text-sm">{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg whitespace-nowrap">
                            <Users size={16} style={{ color: C[200] }} />
                            <span className="font-semibold text-sm">{guests} Guest{guests > 1 ? 's' : ''}</span>
                        </div>
                        <button onClick={() => navigate('/')} className="md:ml-4 px-4 py-1.5 bg-white text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-100 transition shadow-sm whitespace-nowrap">
                            Change Search
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 mt-6">
                <div className="flex flex-col md:flex-row gap-4 items-start">

                    {/* Filters Sidebar */}
                    <aside className="w-full md:w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4 border-b pb-3">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2"><Filter size={18} style={{ color: C[500] }} /> Filters</h3>
                                <button onClick={clearFilters} className="text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 transition" style={{ color: C[500] }}><RotateCcw size={12} /> Clear</button>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Property Name</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input type="text" placeholder="e.g. Hilton" value={nameFilter} onChange={e => setNameFilter(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 outline-none" style={{ '--tw-ring-color': C[500] }} />
                                </div>
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Price Range</label>
                                <input type="range" min={0} max={maxPrice} step={500} value={priceRange[1]} onChange={e => setPriceRange([0, parseInt(e.target.value)])} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: C[500] }} />
                                <div className="flex justify-between text-xs text-gray-500 mt-1 font-medium">
                                    <span>Rs. 0</span>
                                    <span className="font-bold" style={{ color: C[700] }}>up to Rs. {priceRange[1].toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Star Rating</label>
                                <div className="space-y-1.5">
                                    {[5, 4, 3, 2, 1].map(star => (
                                        <label key={star} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" checked={starFilters.includes(star)} onChange={() => toggleStar(star)} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-gray-300" />
                                            <span className="flex items-center text-sm font-medium text-gray-600 group-hover:text-gray-900">
                                                {star} <Star size={12} className="ml-1 text-yellow-400 fill-yellow-400" /> &amp; up
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {allAmenities.length > 0 && (
                                <div className="mb-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Amenities</label>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                        {allAmenities.map(am => (
                                            <label key={am} className="flex items-center gap-2 cursor-pointer group">
                                                <input type="checkbox" checked={amenityFilters.includes(am)} onChange={() => toggleAmenity(am)} className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-gray-300" />
                                                <span className="flex items-center text-xs font-medium text-gray-600 group-hover:text-gray-900">{getAmenityIcon(am)} {am}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Results Stream */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <h2 className="text-2xl font-extrabold text-gray-900">
                                {destination}: <span style={{ color: C[600] }}>{filteredSorted.length} properties found</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowMap(!showMap)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition ${showMap ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'}`} style={showMap ? { background: C[500] } : {}}>
                                    <Map size={15} /> {showMap ? 'List View' : 'Map View'}
                                </button>
                                <ArrowUpDown size={16} className="text-gray-400" />
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 focus:ring-2 outline-none cursor-pointer hover:border-gray-300 transition" style={{ '--tw-ring-color': C[500] }}>
                                    <option value="recommended">Recommended</option>
                                    <option value="price-low">Price: Low → High</option>
                                    <option value="price-high">Price: High → Low</option>
                                    <option value="star-rating">Star Rating</option>
                                </select>
                            </div>
                        </div>
                        {compareList.length > 0 && (
                            <div className="mb-4 p-3 rounded-xl border flex items-center justify-between" style={{ background: `${C[50]}44`, borderColor: `${C[200]}66` }}>
                                <span className="text-sm font-semibold" style={{ color: C[700] }}><GitCompareArrows size={14} className="inline mr-1" />{compareList.length} hotel{compareList.length > 1 ? 's' : ''} selected</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowCompare(true)} disabled={compareList.length < 2} className="px-4 py-1.5 text-white text-xs font-bold rounded-lg disabled:opacity-40 transition" style={{ background: C[500] }}>Compare Now</button>
                                    <button onClick={() => setCompareList([])} className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition">Clear</button>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="space-y-5">
                                {[1, 2, 3].map(n => (
                                    <div key={n} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row h-auto relative animate-pulse">
                                        <div className="w-full sm:w-72 h-48 sm:h-auto relative bg-gray-200 shrink-0"></div>
                                        <div className="p-5 flex flex-col flex-1 w-full">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
                                                <div className="h-6 bg-gray-200 rounded-md w-12 shrink-0"></div>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded-md w-1/3 mb-4"></div>
                                            <div className="space-y-2 mt-1 mb-4 flex-1">
                                                <div className="h-3 bg-gray-200 rounded-md w-full"></div>
                                                <div className="h-3 bg-gray-200 rounded-md w-4/5"></div>
                                            </div>
                                            <div className="flex items-end justify-between mt-auto pt-4 border-t border-gray-50">
                                                <div className="flex gap-2">
                                                    <div className="h-4 w-12 bg-gray-200 rounded-full"></div>
                                                    <div className="h-4 w-12 bg-gray-200 rounded-full"></div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
                                                    <div className="h-10 w-32 bg-gray-200 rounded-xl mt-1"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : hotels.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-lg">
                                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No properties matched your search</h3>
                                <p className="text-gray-500 text-sm max-w-md mx-auto">Try adjusting your filters, selecting a different destination, or changing your travel dates to see more results.</p>
                                <button onClick={() => navigate('/')} className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition">Search Again</button>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {filteredSorted.map(hotel => (
                                    <div key={hotel._id}
                                        onClick={() => navigate(`/hotels/${hotel._id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`)}
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row cursor-pointer h-auto relative">

                                        {/* Image Box */}
                                        <div className="w-full sm:w-72 h-48 sm:h-auto relative overflow-hidden shrink-0 bg-gray-100">
                                            <img
                                                src={hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                                alt={hotel.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent sm:hidden"></div>

                                            {/* Compare checkbox */}
                                            <label className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-white/90 backdrop-blur-sm shadow-md rounded-md cursor-pointer z-10" onClick={e => e.stopPropagation()}>
                                                <input type="checkbox" checked={compareList.includes(hotel._id)} onChange={() => toggleCompare(hotel._id)} className="rounded w-3.5 h-3.5 border-gray-300" style={{ accentColor: C[500] }} />
                                                <span className="text-[10px] font-bold text-gray-700">Compare</span>
                                            </label>
                                        </div>

                                        {/* Content Box */}
                                        <div className="p-5 flex flex-col flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1 gap-2">
                                                <h3 className="text-xl font-extrabold text-gray-900 truncate group-hover:text-blue-700 transition-colors">{hotel.name}</h3>

                                                {/* Star Rating Badge */}
                                                <div className="flex items-center gap-1 bg-amber-500 text-white px-2.5 py-0.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: '#F59E0B' }}><span className="font-bold text-xs">{hotel.starRating}</span><Star size={12} className="fill-white text-white" /></div>
                                            </div>

                                            <div className="flex items-center text-xs text-gray-500 font-medium mb-3">
                                                <MapPin size={12} style={{ color: C[500] }} className="mr-1" />
                                                <span className="truncate">{hotel.address || hotel.city ? `${hotel.address ? hotel.address + ', ' : ''}${hotel.city || ''}` : `${hotel.destination}, Sri Lanka`}</span>
                                                <span className="mx-2 text-gray-300">•</span>
                                                <span className="text-blue-600 hover:underline">Show on map</span>
                                            </div>

                                            <div className="flex-1 min-h-[44px] mb-4 mt-1"><p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                                {hotel.description || "Experience comfort and excellent service at our property, conveniently situated to let you explore the best of the city."}</p></div>

                                            <div className="flex items-end justify-between gap-4 mt-auto pt-4 border-t border-gray-50 w-full">
                                                {/* Amenities Tags */}
                                                <div className="flex flex-wrap gap-2 flex-1">
                                                    {(hotel.amenities || []).slice(0, 3).map((am, i) => (
                                                        <div key={i} className="flex items-center px-2 py-1 bg-gray-50 border border-gray-100 text-gray-600 rounded-md text-[11px] font-semibold tracking-wide whitespace-nowrap">
                                                            {getAmenityIcon(am)} {am}
                                                        </div>
                                                    ))}
                                                    {(hotel.amenities || []).length > 3 && (
                                                        <div className="flex items-center px-2 py-1 bg-gray-50 border border-gray-100 text-gray-500 rounded-md text-[11px] font-bold">
                                                            +{(hotel.amenities.length - 3)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col items-end shrink-0 ml-auto whitespace-nowrap">
                                                    <div className="text-right mb-1.5">
                                                        <span className="text-xs text-gray-500 font-medium">from </span>
                                                        <span className="text-lg font-extrabold text-gray-900">Rs. {(getMinPrice(hotel) || hotel.startingPrice || hotel.price || 15000).toLocaleString()}</span>
                                                        <span className="text-xs font-medium text-gray-400"> / night</span>
                                                    </div>
                                                    <button className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-sm font-bold transition-all shadow-md group-hover:shadow-lg group-hover:-translate-y-0.5" style={{ background: `linear-gradient(135deg, ${C.action || C[600]}, ${C.primary || C[500]})` }}>
                                                        See Availability <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ══ Compare Modal ══ */}
            {showCompare && compareHotels.length >= 2 && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center p-4" onClick={() => setShowCompare(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ background: `linear-gradient(135deg, ${C[800]}, ${C[600]})` }}>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><GitCompareArrows size={18} /> Compare Hotels</h3>
                            <button onClick={() => setShowCompare(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="border-b"><th className="p-4 text-left text-gray-500 font-semibold">Feature</th>{compareHotels.map(h => <th key={h._id} className="p-4 text-left font-bold text-gray-900 min-w-[200px]">{h.name}</th>)}</tr></thead>
                                <tbody>
                                    <tr className="border-b"><td className="p-3 text-gray-500 font-medium">Star Rating</td>{compareHotels.map(h => <td key={h._id} className="p-3 font-semibold">{h.starRating} <Star size={12} className="inline text-yellow-400 fill-yellow-400" /></td>)}</tr>
                                    <tr className="border-b bg-gray-50"><td className="p-3 text-gray-500 font-medium">From Price</td>{compareHotels.map(h => <td key={h._id} className="p-3 font-bold" style={{ color: C[700] }}>{getMinPrice(h) ? `Rs. ${getMinPrice(h).toLocaleString()}/night` : 'N/A'}</td>)}</tr>
                                    <tr className="border-b"><td className="p-3 text-gray-500 font-medium">Location</td>{compareHotels.map(h => <td key={h._id} className="p-3">{h.address || h.city || h.destination}</td>)}</tr>
                                    <tr className="border-b bg-gray-50"><td className="p-3 text-gray-500 font-medium">Amenities</td>{compareHotels.map(h => <td key={h._id} className="p-3"><div className="flex flex-wrap gap-1">{(h.amenities || []).map(a => <span key={a} className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-semibold">{a}</span>)}</div></td>)}</tr>
                                    <tr><td className="p-3"></td>{compareHotels.map(h => <td key={h._id} className="p-3"><button onClick={() => { setShowCompare(false); navigate(`/hotels/${h._id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`); }} className="px-4 py-2 text-white text-xs font-bold rounded-lg" style={{ background: C[500] }}>View Details</button></td>)}</tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
