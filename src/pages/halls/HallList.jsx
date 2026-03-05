import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getHalls } from '../../services/api';
import HallCard from '../../components/HallCard';

export default function HallList() {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ capacityMin: '', capacityMax: '', facility: '', search: '' });

    const fetchHalls = async () => {
        setLoading(true);
        try {
            const params = { active: true };
            if (filters.capacityMin) params.capacityMin = filters.capacityMin;
            if (filters.capacityMax) params.capacityMax = filters.capacityMax;
            if (filters.facility) params.facility = filters.facility;
            const res = await getHalls(params);
            let data = res.data.data || [];
            if (filters.search) {
                const s = filters.search.toLowerCase();
                data = data.filter(h => h.name.toLowerCase().includes(s) || h.description?.toLowerCase().includes(s));
            }
            setHalls(data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => { fetchHalls(); }, []);

    const handleFilter = (e) => { e.preventDefault(); fetchHalls(); };
    const clearFilters = () => { setFilters({ capacityMin: '', capacityMax: '', facility: '', search: '' }); };

    const facilities = ['Stage', 'AC', 'Parking', 'WiFi', 'Projector', 'Sound System', 'Dance Floor', 'Bar Counter'];

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text">Event Halls</h1>
                    <p className="text-muted text-sm mt-1">Find the perfect venue for your event</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input type="text" placeholder="Search halls..." value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                            onKeyDown={e => e.key === 'Enter' && fetchHalls()}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-muted hover:border-secondary hover:text-secondary transition-colors">
                        <SlidersHorizontal size={16} /> Filters
                    </button>
                </div>
            </div>

            {showFilters && (
                <form onSubmit={handleFilter} className="bg-card rounded-xl p-5 mb-6 border border-gray-100" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Min Capacity</label>
                            <input type="number" value={filters.capacityMin} onChange={e => setFilters({ ...filters, capacityMin: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Max Capacity</label>
                            <input type="number" value={filters.capacityMax} onChange={e => setFilters({ ...filters, capacityMax: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" placeholder="500" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Facility</label>
                            <select value={filters.facility} onChange={e => setFilters({ ...filters, facility: e.target.value })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30">
                                <option value="">All Facilities</option>
                                {facilities.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="flex-1 bg-secondary text-white font-semibold py-2 rounded-lg hover:bg-primary transition-colors text-sm">Apply</button>
                            <button type="button" onClick={() => { clearFilters(); fetchHalls(); }}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-muted hover:text-danger transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div></div>
            ) : halls.length === 0 ? (
                <div className="text-center py-20"><p className="text-muted text-lg">No halls found</p></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {halls.map(hall => <HallCard key={hall._id} hall={hall} />)}
                </div>
            )}
        </div>
    );
}
