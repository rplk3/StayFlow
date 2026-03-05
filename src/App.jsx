import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Building2, CalendarDays, LayoutDashboard, ClipboardList, Menu, X, ChevronRight } from 'lucide-react';
import HallList from './pages/halls/HallList';
import HallDetails from './pages/halls/HallDetails';
import NewEventBooking from './pages/bookings/NewEventBooking';
import MyEventBookings from './pages/bookings/MyEventBookings';
import EventBookingDetails from './pages/bookings/EventBookingDetails';
import AdminHalls from './pages/admin/AdminHalls';
import AdminHallForm from './pages/admin/AdminHallForm';
import AdminEventBookings from './pages/admin/AdminEventBookings';
import AdminEventBookingDetails from './pages/admin/AdminEventBookingDetails';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const customerLinks = [
    { to: '/halls', label: 'Event Halls', icon: Building2 },
    { to: '/my-event-bookings', label: 'My Bookings', icon: CalendarDays },
  ];

  const adminLinks = [
    { to: '/admin/halls', label: 'Manage Halls', icon: Building2 },
    { to: '/admin/event-bookings', label: 'Booking Requests', icon: ClipboardList },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  return (
    <div className="min-h-screen bg-bg">
      {/* Top Nav */}
      <nav className="bg-primary text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-1.5 hover:bg-white/10 rounded-lg">
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link to="/" className="flex items-center gap-2 font-bold text-lg">
              <Building2 size={24} />
              <span>Event Hall Manager</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <NavLink to="/halls" className={({ isActive }) => `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!isAdmin ? 'bg-white/20' : 'hover:bg-white/10'}`}>
              Customer
            </NavLink>
            <NavLink to="/admin/event-bookings" className={({ isActive }) => `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isAdmin ? 'bg-white/20' : 'hover:bg-white/10'}`}>
              Admin
            </NavLink>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-60 bg-card border-r border-gray-100 z-30 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`} style={{ boxShadow: sidebarOpen ? '4px 0 10px rgba(0,0,0,0.05)' : 'none' }}>
          <div className="p-4 space-y-1">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3 px-3">{isAdmin ? 'Admin Panel' : 'Customer'}</p>
            {links.map(l => (
              <NavLink key={l.to} to={l.to} onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-secondary/10 text-secondary' : 'text-muted hover:bg-gray-50 hover:text-text'}`}>
                <l.icon size={18} /> {l.label}
              </NavLink>
            ))}
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HallList />} />
          <Route path="/halls" element={<HallList />} />
          <Route path="/halls/:id" element={<HallDetails />} />
          <Route path="/event-bookings/new" element={<NewEventBooking />} />
          <Route path="/my-event-bookings" element={<MyEventBookings />} />
          <Route path="/my-event-bookings/:id" element={<EventBookingDetails />} />
          <Route path="/admin/halls" element={<AdminHalls />} />
          <Route path="/admin/halls/new" element={<AdminHallForm />} />
          <Route path="/admin/halls/:id/edit" element={<AdminHallForm />} />
          <Route path="/admin/event-bookings" element={<AdminEventBookings />} />
          <Route path="/admin/event-bookings/:id" element={<AdminEventBookingDetails />} />
        </Routes>
      </Layout>
    </Router>
  );
}
