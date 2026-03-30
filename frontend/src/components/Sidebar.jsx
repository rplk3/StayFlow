import React from 'react';
import { LayoutDashboard, TrendingUp, AlertTriangle, MessageSquare, FileText } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {

    // Style for inactive and active states
    const navLinkClass = ({ isActive }) =>
        `flex items-center mt-2 py-3 px-6 rounded-lg transition-colors font-medium text-sm ` +
        (isActive
            ? "bg-[#0071c2] text-white border-l-4 border-accent shadow-sm" // Active state - light blue bg, yellow accent border
            : "text-gray-300 hover:bg-[#0048aa] hover:text-white border-l-4 border-transparent"); // Inactive

    return (
        <>
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary text-white transform transition-transform duration-300 ease-in-out border-r border-[#002b6b] shadow-lg ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-0`}>
                <div className="flex items-center justify-center mt-8 mb-6 pb-6 border-b border-[#0048aa] mx-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center mr-3 shadow-sm">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-lg font-bold font-sans tracking-wide">Hotel Analytics</span>
                    </div>
                </div>

                <nav className="mt-4 px-4 space-y-2">
                    
                    <NavLink to="/bi" className={navLinkClass}>
                        <MessageSquare className="w-5 h-5 mr-3" />
                        <span>Customer Support</span>
                    </NavLink>
                </nav>
            </div>
            {isOpen && (
                <div className="fixed inset-0 z-20 bg-black opacity-50 md:hidden" onClick={toggleSidebar}></div>
            )}
        </>
    );
};

export default Sidebar;
