import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, UserCheck, Clock, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const dk = { bg: '#0f1117', card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8' };

const AdminManagement = () => {
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingAdmins = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/auth/pending-admins');
            setPendingAdmins(res.data);
        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: err.response?.data?.message || 'Failed to fetch pending admins',
                icon: 'error',
                background: dk.card,
                color: dk.text,
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingAdmins();
    }, []);

    const handleApprove = async (adminId, adminName) => {
        const result = await Swal.fire({
            title: 'Approve Admin?',
            text: `Are you sure you want to approve ${adminName} for admin access?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, approve it!',
            background: dk.card,
            color: dk.text
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`http://localhost:5000/api/auth/approve-admin/${adminId}`);
                Swal.fire({
                    title: 'Approved!',
                    text: `${adminName} has been approved as an admin!`,
                    icon: 'success',
                    background: dk.card,
                    color: dk.text,
                    confirmButtonColor: '#10b981'
                });
                setPendingAdmins(prev => prev.filter(a => a._id !== adminId));
            } catch (err) {
                Swal.fire({
                    title: 'Error!',
                    text: err.response?.data?.message || 'Failed to approve admin',
                    icon: 'error',
                    background: dk.card,
                    color: dk.text,
                    confirmButtonColor: '#6366f1'
                });
            }
        }
    };

    return (
        <div className="animate-fade-in pb-12">
            <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
                <h1 className="text-3xl font-extrabold" style={{ color: dk.text }}>Admin Management</h1>
            </div>
            <p className="mb-8" style={{ color: dk.textSec }}>Review and approve pending admin registrations.</p>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    <span className="ml-3" style={{ color: dk.textSec }}>Loading pending admins...</span>
                </div>
            ) : pendingAdmins.length === 0 ? (
                <div className="text-center py-16 rounded-xl border" style={{ background: dk.card, borderColor: dk.border }}>
                    <ShieldCheck className="w-16 h-16 text-indigo-500/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2" style={{ color: dk.text }}>All Caught Up!</h3>
                    <p style={{ color: dk.textSec }}>There are no pending admin registrations at this time.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border shadow-sm" style={{ borderColor: dk.border, background: dk.card }}>
                    <table className="min-w-full divide-y" style={{ divideColor: dk.border }}>
                        <thead style={{ background: dk.elevated }}>
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Registered</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider" style={{ color: dk.textSec }}>Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ divideColor: dk.border }}>
                            {pendingAdmins.map((admin) => (
                                <tr key={admin._id} className="transition-colors hover:bg-white/5">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                                {admin.firstName?.[0]}{admin.lastName?.[0]}
                                            </div>
                                            <span className="font-semibold" style={{ color: dk.text }}>{admin.firstName} {admin.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: dk.textSec }}>{admin.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {new Date(admin.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                            <Clock size={14} className="mr-1.5" />
                                            Pending
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleApprove(admin._id, `${admin.firstName} ${admin.lastName}`)}
                                            className="inline-flex items-center px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-all hover:-translate-y-0.5 shadow-sm"
                                            style={{ background: '#10b981' }}
                                        >
                                            <UserCheck size={16} className="mr-2" />
                                            Approve
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
