import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { getHalls, deleteHall } from '../../services/api';

export default function AdminHalls() {
    const [halls, setHalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const fetchHalls = async () => {
        setLoading(true);
        try { const r = await getHalls({}); setHalls(r.data.data || []); } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchHalls(); }, []);

    const handleDelete = async (id) => {
        setDeleting(true); setDeleteError('');
        try { await deleteHall(id); setDeleteModal(null); fetchHalls(); } catch (e) {
            setDeleteError(e.response?.data?.message || 'Delete failed');
        }
        setDeleting(false);
    };

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text">Hall Management</h1>
                    <p className="text-muted text-sm mt-1">{halls.length} halls</p>
                </div>
                <Link to="/admin/halls/new" className="flex items-center gap-1.5 bg-secondary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary transition-colors">
                    <Plus size={16} /> Add Hall
                </Link>
            </div>

            <div className="bg-card rounded-xl overflow-hidden" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-5 py-3 text-muted font-medium">Hall</th>
                                <th className="text-left px-5 py-3 text-muted font-medium">Capacity</th>
                                <th className="text-left px-5 py-3 text-muted font-medium">Pricing</th>
                                <th className="text-left px-5 py-3 text-muted font-medium">Facilities</th>
                                <th className="text-left px-5 py-3 text-muted font-medium">Status</th>
                                <th className="text-right px-5 py-3 text-muted font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {halls.map(h => (
                                <tr key={h._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={h.images?.[0] || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=100'} alt="" className="w-12 h-10 object-cover rounded-lg" />
                                            <span className="font-semibold text-text">{h.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4"><span className="flex items-center gap-1"><Users size={14} className="text-muted" /> {h.capacity}</span></td>
                                    <td className="px-5 py-4 text-accent font-semibold">
                                        {h.priceModel === 'PER_HOUR' ? `LKR ${h.pricePerHour?.toLocaleString()}/hr` : `LKR ${h.fixedPrice?.toLocaleString()}`}
                                    </td>
                                    <td className="px-5 py-4"><span className="text-muted">{h.facilities?.length || 0} facilities</span></td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${h.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${h.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            {h.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Link to={`/admin/halls/${h._id}/edit`} className="p-2 text-muted hover:text-secondary hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></Link>
                                            <button onClick={() => { setDeleteModal(h); setDeleteError(''); }} className="p-2 text-muted hover:text-danger hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl p-6 max-w-md w-full">
                        <div className="flex items-center gap-2 mb-4 text-danger"><AlertTriangle size={24} /> <h3 className="text-lg font-bold">Delete Hall</h3></div>
                        <p className="text-muted text-sm mb-2">Are you sure you want to delete <strong>{deleteModal.name}</strong>?</p>
                        {deleteError && <p className="text-danger text-sm bg-red-50 p-2 rounded-lg mb-3">{deleteError}</p>}
                        <div className="flex gap-3 justify-end mt-4">
                            <button onClick={() => setDeleteModal(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-muted">Cancel</button>
                            <button onClick={() => handleDelete(deleteModal._id)} disabled={deleting} className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
