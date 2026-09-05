import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverAuthStore } from '@/store/driverAuthStore';
import { getDriverBookings, updateDriverTripStatus } from '@/lib/api';
import type { Booking } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, LayoutDashboard, Map as MapIcon, User, LogOut, ClipboardList, Rocket, CheckCircle, Bell, ArrowRight, Play, Check } from 'lucide-react';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { driver, logout } = useDriverAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'trips' | 'vehicle' | 'profile'>('dashboard');

  useEffect(() => {
    if (!driver) { navigate('/driver/login'); return; }
    loadBookings();
  }, [driver, navigate]);

  const loadBookings = async () => {
    try {
      const res = await getDriverBookings();
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      await updateDriverTripStatus(bookingId, newStatus);
      await loadBookings();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/driver/login');
  };

  if (!driver) return null;

  const activeTrips = bookings.filter((b) => b.status === 'Confirmed' || b.status === 'On the Way');
  const completedTrips = bookings.filter((b) => b.status === 'Completed');
  const recentTrips = bookings.slice(0, 10);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Confirmed: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
      'On the Way': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
      Completed: 'bg-green-500/15 text-green-400 border-green-500/25',
      Pending: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block border ${styles[status] || styles['Pending']}`}>
        {status}
      </span>
    );
  };

  const tabs = [
    { id: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'trips' as const, icon: MapIcon, label: 'My Trips' },
    { id: 'vehicle' as const, icon: Car, label: 'My Vehicle' },
    { id: 'profile' as const, icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden relative">
      {/* Ambient glows */}
      <div className="fixed -top-[20%] -right-[10%] w-[50vw] h-[50vw] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed -bottom-[20%] -left-[10%] w-[40vw] h-[40vw] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="px-7 py-4 flex items-center justify-between border-b border-slate-800/60 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-base">Driver Portal</div>
            <div className="text-xs text-slate-400 font-medium">Welcome, {driver.name}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            driver.availability 
              ? 'bg-green-500/15 text-green-400 border-green-500/25' 
              : 'bg-red-500/15 text-red-400 border-red-500/25'
          }`}>
            <div className={`w-2 h-2 rounded-full ${driver.availability ? 'bg-green-400' : 'bg-red-400'}`} />
            {driver.availability ? 'Available' : 'On Trip'}
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-md">
            {driver.name.charAt(0)}
          </div>
          <button 
            onClick={handleLogout} 
            className="p-2 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Nav Tabs */}
      <nav className="flex gap-1 px-7 py-3 border-b border-slate-800/40 bg-slate-900/40 backdrop-blur-md overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl border-none cursor-pointer text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap relative ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-indigo-500/15 rounded-xl border border-indigo-500/20"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-10" /> 
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <div className="p-7 max-w-6xl mx-auto relative z-10">

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full mb-4"
            />
            Loading your trips…
          </div>
        )}

        <AnimatePresence mode="wait">
          {!loading && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* ── DASHBOARD TAB ── */}
              {activeTab === 'dashboard' && (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Total Trips', value: bookings.length, icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
                      { label: 'Active Trips', value: activeTrips.length, icon: Rocket, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                      { label: 'Completed', value: completedTrips.length, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
                      { label: 'Status', value: driver.availability ? 'Free' : 'Busy', icon: Bell, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
                    ].map((s, i) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={s.label} 
                        className={`border rounded-2xl p-5 backdrop-blur-md ${s.bg}`}
                      >
                        <s.icon className={`w-7 h-7 mb-3 ${s.color}`} />
                        <div className="text-3xl font-extrabold">{s.value}</div>
                        <div className="text-xs text-slate-400 mt-1.5 font-medium uppercase tracking-wider">{s.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Active Trip */}
                  {activeTrips.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Active Trip{activeTrips.length > 1 ? 's' : ''}
                      </h3>
                      {activeTrips.map((trip) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={trip._id} 
                          className="bg-slate-800/60 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-6 mb-4 shadow-xl shadow-indigo-500/10 relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />
                          
                          <div className="flex justify-between items-start mb-5 relative z-10">
                            <div>
                              <div className="text-xl font-bold">{trip.guestName}</div>
                              <div className="text-sm text-slate-400 mt-1 font-medium">
                                Booked: {new Date(trip.pickupTime).toLocaleString()}
                              </div>
                            </div>
                            {statusBadge(trip.status)}
                          </div>

                          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 mb-5 relative z-10">
                            <div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Pickup</div>
                              <div className="text-sm font-semibold">{trip.pickupLocation}</div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-indigo-400" />
                            <div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Dropoff</div>
                              <div className="text-sm font-semibold">{trip.dropoffLocation}</div>
                            </div>
                          </div>

                          <div className="relative z-10">
                            {trip.status === 'Confirmed' && (
                              <button
                                disabled={updatingId === trip._id}
                                onClick={() => handleStatusUpdate(trip._id, 'On the Way')}
                                className="w-full py-3.5 rounded-xl border-none cursor-pointer font-bold text-sm text-white tracking-wide transition-all bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                              >
                                {updatingId === trip._id ? (
                                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                ) : <Play className="w-4 h-4 fill-current" />} 
                                Start Trip — On the Way
                              </button>
                            )}

                            {trip.status === 'On the Way' && (
                              <button
                                disabled={updatingId === trip._id}
                                onClick={() => handleStatusUpdate(trip._id, 'Completed')}
                                className="w-full py-3.5 rounded-xl border-none cursor-pointer font-bold text-sm text-white tracking-wide transition-all bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
                              >
                                {updatingId === trip._id ? (
                                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                ) : <Check className="w-5 h-5" />} 
                                Complete Trip
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {activeTrips.length === 0 && (
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-10 text-center mb-8">
                      <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-slate-400" />
                      </div>
                      <div className="text-lg font-bold mb-2">No Active Trips</div>
                      <div className="text-slate-400 text-sm">You're currently available. New trips will appear here when assigned by the admin.</div>
                    </div>
                  )}

                  {/* Recent trips */}
                  {recentTrips.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold mb-4">Recent Trips</h3>
                      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse text-left">
                            <thead>
                              <tr className="border-b border-slate-700/50 bg-slate-800/50">
                                {['Guest', 'Route', 'Date', 'Status'].map((h) => (
                                  <th key={h} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {recentTrips.map((b) => (
                                <tr key={b._id} className="border-b border-slate-700/30 hover:bg-slate-800/40 transition-colors">
                                  <td className="p-4 font-semibold text-sm">{b.guestName}</td>
                                  <td className="p-4 text-sm text-slate-300">
                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                      {b.pickupLocation} <ArrowRight className="w-3 h-3 text-slate-500" /> {b.dropoffLocation}
                                    </div>
                                  </td>
                                  <td className="p-4 text-sm text-slate-400 whitespace-nowrap">
                                    {new Date(b.pickupTime).toLocaleDateString()}
                                  </td>
                                  <td className="p-4">{statusBadge(b.status)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── TRIPS TAB ── */}
              {activeTab === 'trips' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">All My Trips</h2>
                  {bookings.length === 0 ? (
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-12 text-center">
                      <ClipboardList className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <div className="font-bold text-lg mb-2">No trips yet</div>
                      <div className="text-slate-400 text-sm">Trips will appear here when the admin assigns bookings to you.</div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {bookings.map((b) => (
                        <div key={b._id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-800/70 transition-colors">
                          <div>
                            <div className="font-bold text-base mb-1">{b.guestName}</div>
                            <div className="flex items-center gap-2 text-slate-300 text-sm mb-1.5">
                              {b.pickupLocation} <ArrowRight className="w-3 h-3 text-slate-500" /> {b.dropoffLocation}
                            </div>
                            <div className="text-slate-500 text-xs font-medium">
                              {new Date(b.pickupTime).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {statusBadge(b.status)}
                            {b.status === 'Confirmed' && (
                              <button
                                disabled={updatingId === b._id}
                                onClick={() => handleStatusUpdate(b._id, 'On the Way')}
                                className="px-4 py-2 rounded-lg border-none bg-amber-500 text-white text-xs font-bold cursor-pointer hover:bg-amber-600 transition-colors disabled:opacity-50"
                              >Start</button>
                            )}
                            {b.status === 'On the Way' && (
                              <button
                                disabled={updatingId === b._id}
                                onClick={() => handleStatusUpdate(b._id, 'Completed')}
                                className="px-4 py-2 rounded-lg border-none bg-green-500 text-white text-xs font-bold cursor-pointer hover:bg-green-600 transition-colors disabled:opacity-50"
                              >Complete</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── VEHICLE TAB ── */}
              {activeTab === 'vehicle' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">My Vehicle</h2>
                  <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-xl shadow-xl">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6 border border-indigo-500/20">
                      <Car className="w-7 h-7 text-indigo-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      {[
                        { label: 'Type', value: driver.vehicle?.type || '—' },
                        { label: 'Make', value: driver.vehicle?.make || '—' },
                        { label: 'Model', value: driver.vehicle?.model || '—' },
                        { label: 'Year', value: driver.vehicle?.year || '—' },
                        { label: 'Plate Number', value: driver.vehicle?.plateNumber || '—' },
                        { label: 'Capacity', value: `${driver.vehicle?.capacity || '—'} passengers` },
                        { label: 'Color', value: driver.vehicle?.color || '—' },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                            {item.label}
                          </div>
                          <div className="text-sm font-semibold text-slate-200">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── PROFILE TAB ── */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-xl font-bold mb-6">My Profile</h2>
                  <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-xl shadow-xl">
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                        {driver.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xl font-bold">{driver.name}</div>
                        <div className="text-sm text-slate-400 font-medium">Licensed Driver</div>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {[
                        { label: 'Email', value: driver.email },
                        { label: 'Contact', value: driver.contact },
                        { label: 'License Number', value: driver.licenseNumber },
                        { label: 'NIC', value: driver.nic || '—' },
                        { label: 'Address', value: driver.address || '—' },
                        { label: 'Account Status', value: driver.status },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center py-3 border-b border-slate-700/50 last:border-0">
                          <span className="text-sm text-slate-400 font-medium">{item.label}</span>
                          <span className="text-sm font-semibold text-slate-200">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
