import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '@/store/appStore';
import ActiveTripWidget from '../components/transport/guest/ActiveTripWidget';

export default function MyTransportBookings() {
    const { user } = useAuth();
    const { loadData, bookings } = useAppStore();

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const fullName = user ? `${user.firstName} ${user.lastName}` : 'Guest';
    
    // Filter out the user's bookings.
    // We pass all bookings to ActiveTripWidget, but let's override the logic slightly if needed,
    // or just pass the bookings and let it filter. ActiveTripWidget uses `guest?.name`.
    // Since we are using the Hotel's auth, we might need to modify ActiveTripWidget or pass the name in.
    
    // Actually, ActiveTripWidget relies on `useAuthStore` from the transport app.
    // It's better to just pass the filtered bookings directly, or mock the auth store.
    // Let's filter here for safety.
    const myBookings = bookings.filter((b) => b.guestName === fullName);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Transport Bookings</h2>
            <p className="text-gray-500 mb-8 text-sm">View and manage your active and past rides.</p>

            {myBookings.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">You have no transport bookings.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ActiveTripWidget will show the latest one */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 text-gray-800">Current Trip</h3>
                        {/* We will inject the hotel user's name into the widget temporarily by updating authStore, 
                            or we can just let it render if we update ActiveTripWidget. 
                            Wait, ActiveTripWidget expects bookings. Let's pass myBookings. */}
                        <ActiveTripWidget bookings={myBookings} />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-4 text-gray-800">All Bookings</h3>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {myBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((b) => (
                                <div key={b._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-2 text-sm">
                                    <div className="flex justify-between font-bold text-gray-800">
                                        <span>{b.pickupLocation.split(',')[0]} → {b.dropoffLocation.split(',')[0]}</span>
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            b.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            b.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                            b.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>{b.status}</span>
                                    </div>
                                    <div className="text-gray-500">
                                        Pickup: {new Date(b.pickupTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
