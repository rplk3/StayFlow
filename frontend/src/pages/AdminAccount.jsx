import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

const AdminAccount = () => {
    const { user, updateProfile } = useAuth();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    const [status, setStatus] = useState({ type: null, message: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: null, message: '' });

        const res = await updateProfile({ firstName: formData.firstName, lastName: formData.lastName });
        if (res.success) {
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            setTimeout(() => setStatus({ type: null, message: '' }), 3000);
        } else {
            setStatus({ type: 'error', message: res.message });
        }
    };

    return (
        <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-8 h-8 text-[#feba02]" />
                <h1 className="text-3xl font-extrabold text-[#1E3A8A]">Admin Profile</h1>
            </div>
            <p className="text-gray-500 mb-8 max-w-xl">Manage your admin account details.</p>

            {status.message && (
                <div className={`p-4 mb-8 rounded-lg flex items-center shadow-sm ${status.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
                    {status.type === 'success' ? <CheckCircle2 size={24} className="mr-3 text-green-500" /> : <AlertCircle size={24} className="mr-3 text-red-500" />}
                    <span className="font-medium text-sm">{status.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="appearance-none block w-full px-4 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#0071C2] focus:border-[#0071C2] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="appearance-none block w-full px-4 py-3.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-[#0071C2] focus:border-[#0071C2] transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="appearance-none block w-full max-w-md px-4 py-3.5 border border-gray-200 bg-gray-100 text-gray-500 rounded-lg shadow-sm cursor-not-allowed opacity-80"
                        title="Email cannot be changed."
                    />
                    <p className="mt-2.5 text-xs text-gray-500 flex items-center">
                        <AlertCircle size={14} className="mr-1.5 inline" />
                        Your email address is your unique identity and cannot be modified.
                    </p>
                </div>

                <div className="pt-6 border-t border-gray-100">
                    <button
                        type="submit"
                        className="px-8 py-3.5 border border-transparent rounded-lg shadow-md text-sm font-bold tracking-wide uppercase text-white bg-[#0071C2] hover:bg-[#005999] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0071C2] transition-all duration-200 hover:-translate-y-0.5"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAccount;
