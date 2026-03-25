import React from 'react';
import { Menu, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ toggleSidebar }) => {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors">
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold text-textPrimary hidden md:block ml-4">System Overview</h2>
            </div>

            <div className="flex items-center">
                <button className="flex items-center mx-4 text-gray-600 focus:outline-none">
                    <Bell className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 overflow-hidden rounded-full bg-primary flex justify-center items-center text-white font-bold text-xs">
                        {user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : <User className="w-5 h-5" />}
                    </div>
                    {user && (
                        <span className="hidden md:block text-sm font-semibold text-gray-700">
                            {user.firstName} {user.lastName}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
