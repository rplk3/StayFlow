import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { getHallById, createHall, updateHall } from '../../services/api';

const FACILITY_OPTIONS = ['Stage', 'AC', 'Parking', 'WiFi', 'Projector', 'Sound System', 'Dance Floor', 'Bridal Suite', 'Bar Counter', 'Coffee Machine', 'Fireplace', 'River View', 'Video Conferencing', 'Whiteboard', 'Podium', 'Outdoor Stage', 'Garden Lighting', 'Gazebo', 'Ambient Lighting', 'Private Dining Setup'];

export default function AdminHallForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '', description: '', capacity: 50, priceModel: 'PER_HOUR', pricePerHour: 5000, fixedPrice: 30000,
        facilities: [], images: [''], rules: '', isActive: true
    });

    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const r = await getHallById(id);
                const h = r.data.data;
                setForm({
                    name: h.name, description: h.description || '', capacity: h.capacity, priceModel: h.priceModel,
                    pricePerHour: h.pricePerHour || 0, fixedPrice: h.fixedPrice || 0, facilities: h.facilities || [],
                    images: h.images?.length ? h.images : [''], rules: h.rules || '', isActive: h.isActive
                });
            } catch (e) { console.error(e); }
            setLoading(false);
        })();
    }, [id]);

    const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const toggleFacility = (f) => {
        setForm(p => ({ ...p, facilities: p.facilities.includes(f) ? p.facilities.filter(x => x !== f) : [...p.facilities, f] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true); setError('');
        try {
            const data = { ...form, images: form.images.filter(Boolean) };
            if (isEdit) { await updateHall(id, data); } else { await createHall(data); }
            navigate('/admin/halls');
        } catch (e) { setError(e.response?.data?.message || 'Save failed'); }
        setSaving(false);
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div>
            <Link to="/admin/halls" className="inline-flex items-center gap-1.5 text-muted hover:text-secondary transition-colors mb-6 text-sm"><ArrowLeft size={16} /> Back to Halls</Link>
            <h1 className="text-2xl font-bold text-text mb-6">{isEdit ? 'Edit Hall' : 'Create New Hall'}</h1>

            <form onSubmit={handleSubmit} className="max-w-3xl">
                <div className="bg-card rounded-xl p-6 space-y-5" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    {error && <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Hall Name *</label>
                            <input type="text" required value={form.name} onChange={e => upd('name', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Capacity *</label>
                            <input type="number" required min={1} value={form.capacity} onChange={e => upd('capacity', Number(e.target.value))}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Description</label>
                        <textarea rows={3} value={form.description} onChange={e => upd('description', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary resize-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text mb-1">Price Model *</label>
                            <select value={form.priceModel} onChange={e => upd('priceModel', e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary">
                                <option value="PER_HOUR">Per Hour</option>
                                <option value="FIXED">Fixed Price</option>
                            </select>
                        </div>
                        {form.priceModel === 'PER_HOUR' ? (
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Price Per Hour (LKR) *</label>
                                <input type="number" min={1} value={form.pricePerHour} onChange={e => upd('pricePerHour', Number(e.target.value))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" />
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Fixed Price (LKR) *</label>
                                <input type="number" min={1} value={form.fixedPrice} onChange={e => upd('fixedPrice', Number(e.target.value))}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary" />
                            </div>
                        )}
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.isActive} onChange={e => upd('isActive', e.target.checked)} className="w-4 h-4 accent-accent" />
                                <span className="text-sm font-medium text-text">Active</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-2">Facilities</label>
                        <div className="flex flex-wrap gap-2">
                            {FACILITY_OPTIONS.map(f => (
                                <button key={f} type="button" onClick={() => toggleFacility(f)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${form.facilities.includes(f) ? 'bg-secondary text-white' : 'bg-gray-100 text-muted hover:bg-gray-200'}`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Image URLs</label>
                        {form.images.map((img, i) => (
                            <div key={i} className="flex gap-2 mb-2">
                                <input type="url" value={img} onChange={e => { const n = [...form.images]; n[i] = e.target.value; upd('images', n); }}
                                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30" placeholder="https://..." />
                                {form.images.length > 1 && <button type="button" onClick={() => upd('images', form.images.filter((_, j) => j !== i))} className="text-danger text-sm px-2">✕</button>}
                            </div>
                        ))}
                        <button type="button" onClick={() => upd('images', [...form.images, ''])} className="text-secondary text-xs hover:underline">+ Add Image URL</button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text mb-1">Rules</label>
                        <textarea rows={2} value={form.rules} onChange={e => upd('rules', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary resize-none" placeholder="Hall rules and policies..." />
                    </div>

                    <div className="flex gap-3 pt-3 border-t border-gray-100">
                        <button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-secondary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-50">
                            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {isEdit ? 'Update Hall' : 'Create Hall'}</>}
                        </button>
                        <Link to="/admin/halls" className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-muted hover:border-secondary transition-colors">Cancel</Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
