import React from 'react';
import { Menu, User, Bell } from 'lucide-react';

const Topbar = ({ toggleSidebar }) => {
    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10">
            <div className="flex items-center">
                <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none md:hidden">
                    <Menu className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold text-textPrimary hidden md:block ml-4">System Overview</h2>
            </div>

            <div className="flex items-center">
                <button className="flex items-center mx-4 text-gray-600 focus:outline-none">
                    <Bell className="w-6 h-6" />
                </button>
                <div className="relative">
                    <button className="flex items-center focus:outline-none">
                        <div className="w-8 h-8 overflow-hidden rounded-full bg-primary flex justify-center items-center text-white">
                            <User className="w-5 h-5" />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
