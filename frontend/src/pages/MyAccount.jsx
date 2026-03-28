import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Pencil } from 'lucide-react';

const MyAccount = () => {
    const { user, updateProfile } = useAuth();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState({ type: null, message: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                country: user.country || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = () => {
        setIsEditing(true);
        setStatus({ type: null, message: '' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setStatus({ type: null, message: '' });

        const res = await updateProfile({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            country: formData.country
        });

        if (res.success) {
            setStatus({ type: 'success', message: 'Profile updated successfully!' });
            setIsEditing(false);
            setTimeout(() => setStatus({ type: null, message: '' }), 3000);
        } else {
            setStatus({ type: 'error', message: res.message });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                country: user.country || ''
            });
        }
    };

    const inputBase = "appearance-none block w-full px-4 py-3 border rounded-lg text-sm transition-colors";
    const inputEditable = `${inputBase} border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0071C2] focus:border-[#0071C2]`;
    const inputReadOnly = `${inputBase} border-gray-200 bg-gray-50 text-gray-600 cursor-default`;
    const inputDisabled = `${inputBase} border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed`;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">My Account</h1>
            <p className="text-gray-500 text-sm mb-6">Manage your personal information</p>

            {status.message && (
                <div className={`p-3.5 mb-6 rounded-lg flex items-center text-sm ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {status.type === 'success' ? <CheckCircle2 size={18} className="mr-2 text-green-500 flex-shrink-0" /> : <AlertCircle size={18} className="mr-2 text-red-500 flex-shrink-0" />}
                    <span className="font-medium">{status.message}</span>
                </div>
            )}

            <form onSubmit={handleSave}>
                <div className="border border-gray-200 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                            <input
                                type="text" name="firstName"
                                value={formData.firstName} onChange={handleChange}
                                disabled={!isEditing} required
                                className={isEditing ? inputEditable : inputReadOnly}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                            <input
                                type="text" name="lastName"
                                value={formData.lastName} onChange={handleChange}
                                disabled={!isEditing} required
                                className={isEditing ? inputEditable : inputReadOnly}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                            <input
                                type="email" name="email"
                                value={formData.email}
                                disabled
                                className={inputDisabled}
                                title="Email cannot be changed."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                            <input
                                type="tel" name="phone"
                                value={formData.phone} onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="+94 77 123 4567"
                                className={isEditing ? inputEditable : inputReadOnly}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                            <input
                                type="text" name="country"
                                value={formData.country} onChange={handleChange}
                                disabled={!isEditing}
                                placeholder="Sri Lanka"
                                className={isEditing ? inputEditable : inputReadOnly}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#003B95] text-white rounded-lg text-sm font-semibold hover:bg-[#002b6b] transition"
                            >
                                <Pencil size={14} /> Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-[#003B95] text-white rounded-lg text-sm font-semibold hover:bg-[#002b6b] transition"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MyAccount;
