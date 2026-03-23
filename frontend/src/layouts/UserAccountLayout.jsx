import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Map, LogOut } from 'lucide-react';

const UserAccountLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Prevent direct access if not logged in
    React.useEffect(() => {
        if (!user && location.pathname !== '/login') {
            navigate('/login');
        }
    }, [user, navigate, location]);

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { name: 'My Account', path: '/my-account', icon: User },
        { name: 'My Trips', path: '/my-trips', icon: Map },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Minimal Header */}
            <header className="bg-[#003B95] text-white py-4 shadow-md sticky top-0 z-50">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                     <div className="text-2xl font-bold cursor-pointer" onClick={() => navigate('/')}>StayFlow</div>
                     <span className="font-medium text-white shadow-sm px-4 py-2 border border-white rounded bg-white bg-opacity-10">
                         Hi, {user.firstName}
                     </span>
                 </div>
            </header>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-72 flex-shrink-0 bg-white shadow rounded-xl p-6 border border-gray-100 self-start">
                    <nav className="space-y-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            // Match base path to highlight correctly
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className={`flex items-center px-4 py-3.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-[#0071C2] text-white shadow-md transform scale-[1.02]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#003B95]'}`}
                                >
                                    <Icon size={22} className="mr-4" />
                                    <span className="font-semibold text-sm uppercase tracking-wider">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="my-6 border-b border-gray-200"></div>
                    
                    <button 
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-3.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200"
                    >
                        <LogOut size={22} className="mr-4" />
                        <span className="font-semibold text-sm uppercase tracking-wider">Sign Out</span>
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-white shadow rounded-xl p-8 md:p-10 border border-gray-100">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default UserAccountLayout;
