import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background font-sans overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <Topbar toggleSidebar={() => setIsSidebarOpen(true)} />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
