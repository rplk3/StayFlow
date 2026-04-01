import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, ShieldCheck, Pencil } from 'lucide-react';

const dk = { bg: '#0f1117', card: '#1a1d27', elevated: '#252830', border: '#2d3039', text: '#f1f5f9', textSec: '#94a3b8' };

const AdminAccount = () => {
    const { user, updateProfile } = useAuth();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: ''
    });

    const [isEditing, setIsEditing] = useState(false);
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

    const handleEdit = (e) => {
        if (e) e.preventDefault();
        setIsEditing(true);
        setStatus({ type: null, message: '' });
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: null, message: '' });

        const res = await updateProfile({ firstName: formData.firstName, lastName: formData.lastName });
        if (res.success) {
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            setIsEditing(false);
            setTimeout(() => setStatus({ type: null, message: '' }), 3000);
        } else {
            setStatus({ type: 'error', message: res.message });
        }
    };

    const inputBase = "appearance-none block w-full px-4 py-3 border rounded-lg shadow-sm text-sm transition-colors focus:outline-none";
    const inputEditable = `${inputBase} focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] text-[#f1f5f9]`;
    const inputReadOnly = `${inputBase} border-transparent cursor-default`;
    const inputDisabled = `${inputBase} cursor-not-allowed opacity-60 text-[#f1f5f9]`;

    return (
        <div className="max-w-3xl pb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
                <h1 className="text-3xl font-extrabold" style={{ color: dk.text }}>Admin Profile</h1>
            </div>
            <p className="mb-8 max-w-xl" style={{ color: dk.textSec }}>Manage your admin account details.</p>

            {status.message && (
                <div className={`p-4 mb-8 rounded-lg flex items-center shadow-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border-l-4 border-green-500' : 'bg-red-500/10 text-red-400 border-l-4 border-red-500'}`}>
                    {status.type === 'success' ? <CheckCircle2 size={24} className="mr-3 text-green-500" /> : <AlertCircle size={24} className="mr-3 text-red-500" />}
                    <span className="font-medium text-sm">{status.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 p-8 rounded-xl border" style={{ background: dk.card, borderColor: dk.border }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: dk.textSec }}>First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            disabled={!isEditing}
                            className={isEditing ? inputEditable : inputReadOnly}
                            style={{ 
                                background: isEditing ? dk.elevated : 'transparent',
                                borderColor: isEditing ? dk.border : 'transparent',
                                color: dk.text
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: dk.textSec }}>Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            disabled={!isEditing}
                            className={isEditing ? inputEditable : inputReadOnly}
                            style={{ 
                                background: isEditing ? dk.elevated : 'transparent',
                                borderColor: isEditing ? dk.border : 'transparent',
                                color: dk.text
                            }}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: dk.textSec }}>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className={inputDisabled}
                        style={{ background: dk.elevated, borderColor: dk.border, color: dk.textSec }}
                        title="Email cannot be changed."
                    />
                    <p className="mt-2.5 text-xs flex items-center" style={{ color: dk.textSec }}>
                        <AlertCircle size={14} className="mr-1.5 inline" />
                        Your email address is your unique identity and cannot be modified.
                    </p>
                </div>

                <div className="pt-6 border-t flex gap-3" style={{ borderColor: dk.border }}>
                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-6 py-2.5 text-white rounded-lg text-sm font-semibold transition hover:-translate-y-0.5 shadow-md"
                            style={{ background: '#6366f1' }}
                        >
                            <Pencil size={14} /> Edit Profile
                        </button>
                    ) : (
                        <>
                            <button
                                type="submit"
                                className="px-6 py-2.5 text-white rounded-lg text-sm font-semibold transition hover:-translate-y-0.5 shadow-md"
                                style={{ background: '#10b981' }}
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2.5 border rounded-lg text-sm font-semibold transition hover:bg-white/5"
                                style={{ borderColor: dk.border, color: dk.textSec }}
                            >
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AdminAccount;
