import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit3, Trash2, ToggleLeft, ToggleRight, Star, X, Building2, ImagePlus, ChevronLeft, ChevronRight, MapPin, Tag } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = 'http://localhost:5000/api/admin/hotels';
const dk = { bg: '#0f1117', card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8' };

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
            Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to fetch hotels', icon: 'error', background: dk.card, color: dk.text });
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
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = {
            ...form,
            starRating: parseInt(form.starRating),
            amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
            images: form.images ? form.images.split(',').map(i => i.trim()).filter(Boolean) : []
        };

        try {
            if (editing) {
                await axios.put(`${API_BASE}/${editing}`, payload, { headers });
                Swal.fire({ title: 'Updated!', text: 'Hotel updated successfully.', icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
            } else {
                await axios.post(API_BASE, payload, { headers });
                Swal.fire({ title: 'Created!', text: 'Hotel created successfully!', icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
            }
            setShowModal(false);
            fetchHotels();
        } catch (err) {
            Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to save hotel', icon: 'error', background: dk.card, color: dk.text });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: 'Delete Hotel?',
            text: `Are you sure you want to delete "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Yes, delete it!',
            background: dk.card,
            color: dk.text
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE}/${id}`, { headers });
                Swal.fire({ title: 'Deleted!', text: 'Hotel deleted successfully.', icon: 'success', background: dk.card, color: dk.text, timer: 2000, showConfirmButton: false });
                fetchHotels();
            } catch (err) {
                Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to delete hotel', icon: 'error', background: dk.card, color: dk.text });
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axios.put(`${API_BASE}/${id}/status`, {}, { headers });
            fetchHotels();
        } catch (err) {
            Swal.fire({ title: 'Error!', text: err.response?.data?.message || 'Failed to toggle status', icon: 'error', background: dk.card, color: dk.text });
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm border";
    const labelClass = "block text-xs font-bold uppercase tracking-wider mb-2 mt-4 text-gray-400";

    return (
        <div className="animate-fade-in pb-12" style={{ color: dk.text }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-indigo-400" />
                        <h1 className="text-3xl font-extrabold">Hotel Management</h1>
                    </div>
                    <p className="mt-1" style={{ color: dk.textSec }}>Manage all hotels, their details, and status. <span className="font-semibold text-white">{total}</span> hotels total.</p>
                </div>
                <button onClick={openAddModal} className="flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold text-sm transition-all hover:-translate-y-0.5 shadow-md" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <Plus size={18} /> Add Hotel
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search hotels by name, destination, city..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                        style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}
                    />
                </form>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm min-w-[160px]"
                    style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    <span className="ml-3" style={{ color: dk.textSec }}>Loading hotels...</span>
                </div>
            ) : hotels.length === 0 ? (
                <div className="text-center py-16 rounded-xl border" style={{ background: dk.card, borderColor: dk.border }}>
                    <Building2 className="w-16 h-16 text-indigo-500/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Hotels Found</h3>
                    <p style={{ color: dk.textSec }}>Try adjusting your search or add a new hotel.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border shadow-sm" style={{ background: dk.card, borderColor: dk.border }}>
                    <table className="min-w-full divide-y" style={{ divideColor: dk.border }}>
                        <thead style={{ background: dk.elevated }}>
                            <tr>
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Hotel</th>
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Location</th>
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Rating</th>
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Price</th>
                                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Status</th>
                                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ divideColor: dk.border }}>
                            {hotels.map((hotel) => (
                                <tr key={hotel._id} className="transition-colors hover:bg-white/5">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-4 shadow-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                                {hotel.name?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white">{hotel.name}</div>
                                                <div className="text-xs mt-0.5 max-w-[200px] truncate" style={{ color: dk.textSec }}>{hotel.description || 'No description'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm" style={{ color: dk.textSec }}>
                                        <div className="text-gray-300">{hotel.destination}</div>
                                        {hotel.city && <div className="text-xs">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</div>}
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
                                            hotel.priceRange === 'luxury' || hotel.priceRange === 'ultra-luxury' ? 'bg-purple-900/30 text-purple-400 border border-purple-500/20' :
                                            hotel.priceRange === 'mid-range' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/20' :
                                            'bg-green-900/30 text-green-400 border border-green-500/20'
                                        }`}>
                                            {hotel.priceRange || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${hotel.status === 'active' ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
                                            <span className={`w-2 h-2 rounded-full mr-1.5 ${hotel.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                            {hotel.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleToggleStatus(hotel._id)} className="p-2 rounded-lg hover:bg-white/10 transition" title={hotel.status === 'active' ? 'Deactivate' : 'Activate'}>
                                                {hotel.status === 'active' ?
                                                    <ToggleRight size={20} className="text-green-500" /> :
                                                    <ToggleLeft size={20} className="text-gray-500" />
                                                }
                                            </button>
                                            <button onClick={() => openEditModal(hotel)} className="p-2 rounded-lg hover:bg-indigo-500/20 transition" title="Edit">
                                                <Edit3 size={18} className="text-indigo-400" />
                                            </button>
                                            <button onClick={() => handleDelete(hotel._id, hotel.name)} className="p-2 rounded-lg hover:bg-red-500/20 transition" title="Delete">
                                                <Trash2 size={18} className="text-red-400" />
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
                    <p className="text-sm" style={{ color: dk.textSec }}>Page {page} of {totalPages} ({total} hotels)</p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition"
                            style={{ borderColor: dk.border, background: dk.card }}
                        >
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition"
                            style={{ borderColor: dk.border, background: dk.card }}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" style={{ background: dk.card, border: `1px solid ${dk.border}` }}>
                        <div className="flex items-center justify-between px-8 py-5 border-b sticky top-0 rounded-t-2xl z-10" style={{ background: dk.card, borderColor: dk.border }}>
                            <h2 className="text-2xl font-bold text-white">
                                {editing ? 'Edit Hotel' : 'Add New Hotel'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition" style={{ color: dk.textSec }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-8 space-y-2">
                            {/* Basic Info */}
                            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-indigo-400 mb-2">
                                <Building2 size={14} /> Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Hotel Name *</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="e.g. Grand Hyatt" />
                                </div>
                                <div>
                                    <label className={labelClass}>Destination *</label>
                                    <input type="text" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="e.g. Colombo" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className={labelClass}>Description</label>
                                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} h-24 resize-none`} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="Brief description of the hotel..." />
                            </div>

                            {/* Location */}
                            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-indigo-400 mb-2 mt-8">
                                <MapPin size={14} /> Location & Contact
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Address</label>
                                    <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                                </div>
                                <div>
                                    <label className={labelClass}>City</label>
                                    <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                                </div>
                                <div>
                                    <label className={labelClass}>Country</label>
                                    <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                                </div>
                                <div>
                                    <label className={labelClass}>Phone</label>
                                    <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Email</label>
                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} />
                                </div>
                            </div>

                            {/* Classification */}
                            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-indigo-400 mb-2 mt-8">
                                <Tag size={14} /> Classification
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelClass}>Star Rating</label>
                                    <select value={form.starRating} onChange={(e) => setForm({ ...form, starRating: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Price Range</label>
                                    <select value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                                        <option value="budget">Budget</option>
                                        <option value="mid-range">Mid-Range</option>
                                        <option value="luxury">Luxury</option>
                                        <option value="ultra-luxury">Ultra Luxury</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Status</label>
                                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Amenities & Images */}
                            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-indigo-400 mb-2 mt-8">
                                <ImagePlus size={14} /> Amenities & Images
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className={labelClass}>Amenities</label>
                                    <input type="text" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className={inputClass} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="WiFi, Pool, Spa..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Image URLs</label>
                                    <textarea value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className={`${inputClass} h-20 resize-none`} style={{ background: dk.elevated, borderColor: dk.border, color: dk.text }} placeholder="https://..." />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t" style={{ borderColor: dk.border }}>
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-lg border text-sm font-semibold transition hover:bg-white/5" style={{ borderColor: dk.border, color: dk.text }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="px-8 py-3 rounded-lg text-white text-sm font-bold transition-all disabled:opacity-50 shadow-md hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
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
