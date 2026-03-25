import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, UserCheck, Clock, AlertCircle } from 'lucide-react';

const AdminManagement = () => {
    const [pendingAdmins, setPendingAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchPendingAdmins = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/auth/pending-admins');
            setPendingAdmins(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch pending admins');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingAdmins();
    }, []);

    const handleApprove = async (adminId, adminName) => {
        try {
            await axios.put(`http://localhost:5000/api/auth/approve-admin/${adminId}`);
            setSuccessMsg(`${adminName} has been approved as an admin!`);
            setPendingAdmins(prev => prev.filter(a => a._id !== adminId));
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve admin');
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-8 h-8 text-[#feba02]" />
                <h1 className="text-3xl font-extrabold text-[#1E3A8A]">Admin Management</h1>
            </div>
            <p className="text-gray-500 mb-8">Review and approve pending admin registrations.</p>

            {successMsg && (
                <div className="p-4 mb-6 rounded-lg flex items-center bg-green-50 text-green-800 border-l-4 border-green-500 shadow-sm">
                    <UserCheck size={22} className="mr-3 text-green-500" />
                    <span className="font-medium text-sm">{successMsg}</span>
                </div>
            )}

            {error && (
                <div className="p-4 mb-6 rounded-lg flex items-center bg-red-50 text-red-800 border-l-4 border-red-500 shadow-sm">
                    <AlertCircle size={22} className="mr-3 text-red-500" />
                    <span className="font-medium text-sm">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0071C2]"></div>
                    <span className="ml-3 text-gray-500">Loading pending admins...</span>
                </div>
            ) : pendingAdmins.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                    <UserCheck className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</h3>
                    <p className="text-gray-500">There are no pending admin registrations at this time.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Registered</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {pendingAdmins.map((admin) => (
                                <tr key={admin._id} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-bold text-sm mr-3">
                                                {admin.firstName?.[0]}{admin.lastName?.[0]}
                                            </div>
                                            <span className="font-semibold text-gray-800">{admin.firstName} {admin.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{admin.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(admin.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                                            <Clock size={14} className="mr-1.5" />
                                            Pending
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                            onClick={() => handleApprove(admin._id, `${admin.firstName} ${admin.lastName}`)}
                                            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all hover:-translate-y-0.5 shadow-sm"
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
