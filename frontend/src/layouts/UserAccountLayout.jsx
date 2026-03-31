import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Map, LogOut, PartyPopper, CreditCard, Home } from 'lucide-react';
import Swal from 'sweetalert2';

const UserAccountLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (!user && location.pathname !== '/login') {
            navigate('/login');
        }
    }, [user, navigate, location]);

    if (!user) return null;

    const handleLogout = () => {
        Swal.fire({
            title: 'Sign Out',
            text: 'Are you sure you want to sign out?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Yes, sign out'
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                navigate('/');
            }
        });
    };

    const navItems = [
        { name: 'My Account', path: '/my-account', icon: User },
        { name: 'My Trips', path: '/my-trips', icon: Map },
        { name: 'My Event Bookings', path: '/my-event-bookings', icon: PartyPopper },
        { name: 'My Payments', path: '/my-payments', icon: CreditCard },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-[#003B95] text-white py-3 shadow-md sticky top-0 z-50 flex-shrink-0">
                <div className="px-6 flex justify-between items-center">
                    <div className="text-xl font-bold cursor-pointer" onClick={() => navigate('/')}>StayFlow</div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="hidden md:flex items-center gap-2 text-sm font-medium text-white hover:text-gray-200 transition bg-white/10 px-4 py-1.5 rounded-lg border border-white/30 hover:bg-white/20">
                            <Home size={16} /> Back to Home
                        </button>
                        <span className="font-medium text-white text-sm px-4 py-1.5 border border-transparent rounded-lg">
                            Hi, {user.firstName}
                        </span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar — full height, left-aligned */}
                <aside className="w-56 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
                    <div className="px-5 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
                        <h2 className="text-lg font-bold text-[#003B95]">StayFlow</h2>
                        <p className="text-xs text-gray-400 mt-0.5">User Profile</p>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${isActive ? 'bg-[#003B95] text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-[#003B95]'}`}
                                >
                                    <Icon size={18} className="mr-3 flex-shrink-0" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="px-3 pb-6 border-t border-gray-100 pt-3 flex-shrink-0">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-all text-sm font-medium"
                        >
                            <LogOut size={18} className="mr-3" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default UserAccountLayout;
