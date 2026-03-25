import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit3, Trash2, ToggleLeft, ToggleRight, Star, X, Building2, ImagePlus, ChevronLeft, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/admin/hotels';

const emptyForm = {
    name: '', destination: '', description: '', address: '', city: '', country: '',
    phone: '', email: '', starRating: 3, priceRange: 'mid-range', amenities: '', images: '', status: 'active'
};

const HotelManagement = () => {
    const [hotels, setHotels] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const res = await axios.get(API_BASE, { headers, params });
            setHotels(res.data.hotels);
            setTotal(res.data.total);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch hotels');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHotels(); }, [page, statusFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchHotels();
    };

    const openAddModal = () => {
        setEditing(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    };

    const openEditModal = (hotel) => {
        setEditing(hotel._id);
        setForm({
            name: hotel.name || '',
            destination: hotel.destination || '',
            description: hotel.description || '',
            address: hotel.address || '',
            city: hotel.city || '',
            country: hotel.country || '',
            phone: hotel.phone || '',
            email: hotel.email || '',
            starRating: hotel.starRating || 3,
            priceRange: hotel.priceRange || 'mid-range',
            amenities: (hotel.amenities || []).join(', '),
            images: (hotel.images || []).join(', '),
            status: hotel.status || 'active'
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const payload = {
            ...form,
            starRating: parseInt(form.starRating),
            amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
            images: form.images ? form.images.split(',').map(i => i.trim()).filter(Boolean) : []
        };

        try {
            if (editing) {
                await axios.put(`${API_BASE}/${editing}`, payload, { headers });
                setSuccessMsg('Hotel updated successfully!');
            } else {
                await axios.post(API_BASE, payload, { headers });
                setSuccessMsg('Hotel created successfully!');
            }
            setShowModal(false);
            fetchHotels();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save hotel');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await axios.delete(`${API_BASE}/${id}`, { headers });
            setSuccessMsg('Hotel deleted successfully!');
            fetchHotels();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete hotel');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axios.put(`${API_BASE}/${id}/status`, {}, { headers });
            fetchHotels();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to toggle status');
        }
    };

    const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071C2] focus:border-transparent outline-none transition text-sm";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-[#0071C2]" />
                        <h1 className="text-3xl font-extrabold text-[#1E3A8A]">Hotel Management</h1>
                    </div>
                    <p className="text-gray-500 mt-1">Manage all hotels, their details, and status. <span className="font-semibold text-gray-700">{total}</span> hotels total.</p>
                </div>
                <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 bg-[#0071C2] text-white rounded-lg font-semibold text-sm hover:bg-[#005999] transition-all hover:-translate-y-0.5 shadow-md">
                    <Plus size={18} /> Add Hotel
                </button>
            </div>

            {/* Success Message */}
            {successMsg && (
                <div className="p-4 mb-4 rounded-lg bg-green-50 text-green-800 border-l-4 border-green-500 text-sm font-medium shadow-sm">{successMsg}</div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search hotels by name, destination, city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071C2] focus:border-transparent outline-none text-sm"
                    />
                </form>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071C2] outline-none text-sm bg-white min-w-[160px]"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071C2]"></div>
                    <span className="ml-3 text-gray-500">Loading hotels...</span>
                </div>
            ) : hotels.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Hotels Found</h3>
                    <p className="text-gray-400">Try adjusting your search or add a new hotel.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Hotel</th>
                                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {hotels.map((hotel) => (
                                <tr key={hotel._id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#003B95] to-[#0071C2] flex items-center justify-center text-white font-bold text-lg mr-4 shadow-sm flex-shrink-0">
                                                {hotel.name?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{hotel.name}</div>
                                                <div className="text-xs text-gray-400 mt-0.5 max-w-[200px] truncate">{hotel.description || 'No description'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-gray-600">
                                        <div>{hotel.destination}</div>
                                        {hotel.city && <div className="text-xs text-gray-400">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</div>}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1">
                                            {[...Array(hotel.starRating || 0)].map((_, i) => (
                                                <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                            hotel.priceRange === 'luxury' || hotel.priceRange === 'ultra-luxury' ? 'bg-purple-100 text-purple-700' :
                                            hotel.priceRange === 'mid-range' ? 'bg-blue-100 text-blue-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {hotel.priceRange || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${hotel.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            <span className={`w-2 h-2 rounded-full mr-1.5 ${hotel.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {hotel.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleToggleStatus(hotel._id)} className="p-2 rounded-lg hover:bg-gray-100 transition" title={hotel.status === 'active' ? 'Deactivate' : 'Activate'}>
                                                {hotel.status === 'active' ?
                                                    <ToggleRight size={20} className="text-green-600" /> :
                                                    <ToggleLeft size={20} className="text-gray-400" />
                                                }
                                            </button>
                                            <button onClick={() => openEditModal(hotel)} className="p-2 rounded-lg hover:bg-blue-100 transition" title="Edit">
                                                <Edit3 size={18} className="text-blue-600" />
                                            </button>
                                            <button onClick={() => handleDelete(hotel._id, hotel.name)} className="p-2 rounded-lg hover:bg-red-100 transition" title="Delete">
                                                <Trash2 size={18} className="text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-500">Page {page} of {totalPages} ({total} hotels)</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                        >
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                            <h2 className="text-2xl font-bold text-[#1E3A8A]">
                                {editing ? 'Edit Hotel' : 'Add New Hotel'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">{error}</div>
                            )}

                            {/* Basic Info */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Building2 size={16} className="text-[#0071C2]" /> Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Hotel Name *</label>
                                        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} placeholder="e.g. Grand Hyatt" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Destination *</label>
                                        <input type="text" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required className={inputClass} placeholder="e.g. Colombo" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className={labelClass}>Description</label>
                                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-24 resize-none`} placeholder="Brief description of the hotel..." />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">📍 Location & Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Address</label>
                                        <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} placeholder="Street address" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>City</label>
                                        <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} placeholder="City" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Country</label>
                                        <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} placeholder="Country" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Phone</label>
                                        <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+94 11 234 5678" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Email</label>
                                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="info@hotel.com" />
                                    </div>
                                </div>
                            </div>

                            {/* Classification */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4">⭐ Classification</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className={labelClass}>Star Rating</label>
                                        <select value={form.starRating} onChange={(e) => setForm({ ...form, starRating: e.target.value })} className={inputClass}>
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Price Range</label>
                                        <select value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })} className={inputClass}>
                                            <option value="budget">Budget</option>
                                            <option value="mid-range">Mid-Range</option>
                                            <option value="luxury">Luxury</option>
                                            <option value="ultra-luxury">Ultra Luxury</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Status</label>
                                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Amenities & Images */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <ImagePlus size={16} className="text-[#0071C2]" /> Amenities & Images
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className={labelClass}>Amenities <span className="text-gray-400 font-normal">(comma separated)</span></label>
                                        <input type="text" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className={inputClass} placeholder="WiFi, Pool, Spa, Gym, Restaurant" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Image URLs <span className="text-gray-400 font-normal">(comma separated)</span></label>
                                        <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className={`${inputClass} h-20 resize-none`} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-lg border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="px-8 py-3 rounded-lg bg-[#0071C2] text-white text-sm font-bold hover:bg-[#005999] transition-all disabled:opacity-50 shadow-md hover:-translate-y-0.5">
                                    {saving ? 'Saving...' : editing ? 'Update Hotel' : 'Create Hotel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelManagement;
