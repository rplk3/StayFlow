import React from 'react';
import { Menu, User, Bell, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
    const { user } = useAuth();

    return (
        <header className="flex items-center justify-between px-6 py-4 z-10 border-b" style={{ background: '#1a1d27', borderColor: '#2d3039' }}>
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="text-gray-400 hover:text-white focus:outline-none transition-colors p-1 rounded-lg hover:bg-white/5" title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
                    {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
                </button>
                <h2 className="text-xl font-semibold text-white hidden md:block ml-4">System Overview</h2>
            </div>

            <div className="flex items-center">
                <button className="flex items-center mx-4 text-gray-400 hover:text-white transition-colors focus:outline-none">
                    <Bell className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 overflow-hidden rounded-full flex justify-center items-center text-white font-bold text-xs" style={{ background: '#6366f1' }}>
                        {user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : <User className="w-5 h-5" />}
                    </div>
                    {user && (
                        <span className="hidden md:block text-sm font-semibold text-gray-300">
                            {user.firstName} {user.lastName}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
