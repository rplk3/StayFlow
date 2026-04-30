import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { getAdminRole, isAuthorizedForRoute } from '../utils/roleHelpers';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user } = useAuth();
    const location = useLocation();

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

    // Check Route Authorization
    const role = getAdminRole(user?.email);
    if (!isAuthorizedForRoute(role, location.pathname)) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return (
        <div className="flex h-screen font-sans overflow-hidden" style={{ background: '#0f1117' }}>
            {/* Sidebar wrapper */}
            <div
                className="transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden"
                style={{ width: isSidebarOpen ? '16rem' : '0' }}
            >
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <Topbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6" style={{ background: '#0f1117' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
