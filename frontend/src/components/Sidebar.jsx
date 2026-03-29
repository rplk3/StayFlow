import React, { useState } from 'react';
import { LayoutDashboard, TrendingUp, AlertTriangle, MessageSquare, FileText, ChevronDown, ChevronRight, Calendar, Car, CalendarCheck, CreditCard, Bot, User, ShieldCheck, LogOut, DoorOpen } from 'lucide-react';
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

    const navLinkClass = ({ isActive }) =>
        `flex items-center mt-1 py-2.5 px-4 rounded-lg transition-all font-medium text-sm ` +
        (isActive
            ? "bg-white/10 text-white border-l-3 border-indigo-400 shadow-sm"
            : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border-l-3 border-transparent");

    return (
        <>
            <div className="w-64 h-full text-white border-r flex flex-col flex-shrink-0" style={{ background: '#141620', borderColor: '#2d3039' }}>
                <div className="flex items-center justify-center mt-8 mb-6 pb-6 border-b mx-4" style={{ borderColor: '#2d3039' }}>
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold font-sans tracking-wide text-white">StayFlow Admin</span>
                    </div>
                </div>

                <nav className="mt-2 px-3 space-y-1 flex-1 overflow-y-auto pb-4">
                    <NavLink to="/admin/dashboard" className={navLinkClass} end>
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        <span>Dashboard</span>
                    </NavLink>
                    
                    {/* Analytics Dropdown */}
                    <div>
                        <button 
                            onClick={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
                            className="w-full flex items-center justify-between mt-1 py-2.5 px-4 rounded-lg transition-all font-medium text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200"
                        >
                            <div className="flex items-center">
                                <TrendingUp className="w-5 h-5 mr-3" />
                                <span>Analytics</span>
                            </div>
                            {isAnalyticsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        
                        {isAnalyticsOpen && (
                            <div className="ml-4 mt-1 space-y-1 border-l pl-2" style={{ borderColor: '#2d3039' }}>
                                <NavLink to="/admin/forecast" className={navLinkClass}>
                                    <TrendingUp className="w-4 h-4 mr-3" />
                                    <span>Forecasting</span>
                                </NavLink>
                                <NavLink to="/admin/reports" className={navLinkClass}>
                                    <FileText className="w-4 h-4 mr-3" />
                                    <span>Reports & Exports</span>
                                </NavLink>
                                <NavLink to="/admin/alerts" className={navLinkClass}>
                                    <AlertTriangle className="w-4 h-4 mr-3" />
                                    <span>Alerts</span>
                                </NavLink>
                                <NavLink to="/admin/bi" className={navLinkClass}>
                                    <MessageSquare className="w-4 h-4 mr-3" />
                                    <span>Conversational BI</span>
                                </NavLink>
                            </div>
                        )}
                    </div>

                    <div className="pt-3 mt-3 border-t" style={{ borderColor: '#2d3039' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 px-4 mb-2">Management</p>
                    </div>

                    <NavLink to="/admin/hotels" className={navLinkClass}>
                        <Calendar className="w-5 h-5 mr-3" />
                        <span>Hotel Management</span>
                    </NavLink>
                    <NavLink to="/admin/rooms" className={navLinkClass}>
                        <DoorOpen className="w-5 h-5 mr-3" />
                        <span>Room Management</span>
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

                {/* Bottom Section */}
                <div className="px-3 pb-6 border-t pt-4 space-y-1" style={{ borderColor: '#2d3039' }}>
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
                        className="w-full flex items-center mt-1 py-2.5 px-4 rounded-lg transition-all font-medium text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
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
