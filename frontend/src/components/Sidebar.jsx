import React, { useState } from 'react';
import { LayoutDashboard, TrendingUp, AlertTriangle, MessageSquare, FileText, ChevronDown, ChevronRight, Calendar, Car, CalendarCheck, CreditCard, Bot, User, ShieldCheck, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/admin-login');
    };

    // Style for inactive and active states
    const navLinkClass = ({ isActive }) =>
        `flex items-center mt-2 py-3 px-6 rounded-lg transition-colors font-medium text-sm ` +
        (isActive
            ? "bg-[#0071c2] text-white border-l-4 border-accent shadow-sm"
            : "text-gray-300 hover:bg-[#0048aa] hover:text-white border-l-4 border-transparent");

    return (
        <>
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-primary text-white transform transition-transform duration-300 ease-in-out border-r border-[#002b6b] shadow-lg flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ minWidth: isOpen ? '16rem' : '0' }}>
                <div className="flex items-center justify-center mt-8 mb-6 pb-6 border-b border-[#0048aa] mx-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center mr-3 shadow-sm">
                            <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-lg font-bold font-sans tracking-wide">StayFlow Admin</span>
                    </div>
                </div>

                <nav className="mt-4 px-4 space-y-2 flex-1 overflow-y-auto pb-4">
                    <NavLink to="/admin/dashboard" className={navLinkClass} end>
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        <span>Dashboard</span>
                    </NavLink>
                    
                    {/* Analytics Dropdown */}
                    <div>
                        <button 
                            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                            className="w-full flex items-center justify-between mt-2 py-3 px-6 rounded-lg transition-colors font-medium text-sm text-gray-300 hover:bg-[#0048aa] hover:text-white border-l-4 border-transparent"
                        >
                            <div className="flex items-center">
                                <TrendingUp className="w-5 h-5 mr-3" />
                                <span>Analytics</span>
                            </div>
                            {isAnalyticsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        
                        {isAnalyticsOpen && (
                            <div className="ml-8 mt-2 space-y-2">
                                <NavLink to="/admin/forecast" className={navLinkClass}>
                                    <TrendingUp className="w-5 h-5 mr-3" />
                                    <span>Forecasting</span>
                                </NavLink>
                                <NavLink to="/admin/reports" className={navLinkClass}>
                                    <FileText className="w-5 h-5 mr-3" />
                                    <span>Reports & Exports</span>
                                </NavLink>
                                <NavLink to="/admin/alerts" className={navLinkClass}>
                                    <AlertTriangle className="w-5 h-5 mr-3" />
                                    <span>Alerts</span>
                                </NavLink>
                                <NavLink to="/admin/bi" className={navLinkClass}>
                                    <MessageSquare className="w-5 h-5 mr-3" />
                                    <span>Conversational BI</span>
                                </NavLink>
                            </div>
                        )}
                    </div>

                    <NavLink to="/admin/hotels" className={navLinkClass}>
                        <Calendar className="w-5 h-5 mr-3" />
                        <span>Hotel Management</span>
                    </NavLink>
                    <NavLink to="/admin/transport" className={navLinkClass}>
                        <Car className="w-5 h-5 mr-3" />
                        <span>Guest Transport</span>
                    </NavLink>
                    <NavLink to="/admin/event-bookings" className={navLinkClass}>
                        <CalendarCheck className="w-5 h-5 mr-3" />
                        <span>Event Bookings</span>
                    </NavLink>
                    <NavLink to="/admin/payments" className={navLinkClass}>
                        <CreditCard className="w-5 h-5 mr-3" />
                        <span>Payments</span>
                    </NavLink>
                    <NavLink to="/admin/chatbot" className={navLinkClass}>
                        <Bot className="w-5 h-5 mr-3" />
                        <span>Chatbot</span>
                    </NavLink>
                </nav>

                {/* Bottom Section: Account & Logout */}
                <div className="px-4 pb-6 border-t border-[#0048aa] pt-4 space-y-2">
                    <NavLink to="/admin/account" className={navLinkClass}>
                        <User className="w-5 h-5 mr-3" />
                        <span>My Account</span>
                    </NavLink>
                    <NavLink to="/admin/manage-admins" className={navLinkClass}>
                        <ShieldCheck className="w-5 h-5 mr-3" />
                        <span>Manage Admins</span>
                    </NavLink>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center mt-2 py-3 px-6 rounded-lg transition-colors font-medium text-sm text-red-300 hover:bg-red-900 hover:bg-opacity-40 hover:text-red-200 border-l-4 border-transparent"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
            {isOpen && (
                <div className="fixed inset-0 z-20 bg-black opacity-50 md:hidden" onClick={toggleSidebar}></div>
            )}
        </>
    );
};

export default Sidebar;
