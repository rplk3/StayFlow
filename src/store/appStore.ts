import { create } from 'zustand';
import { getBookings, getDrivers, getVehicles } from '../lib/api';
import type { Booking, Driver, Vehicle } from '../types';

interface AppState {
  bookings: Booking[];
  drivers: Driver[];
  vehicles: Vehicle[];
  loading: boolean;
  loadData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  bookings: [],
  drivers: [],
  vehicles: [],
  loading: false,
  loadData: async () => {
    set({ loading: true });
    try {
      const [bRes, dRes, vRes] = await Promise.all([
        getBookings(),
        getDrivers(),
        getVehicles(),
      ]);
      set({
        bookings: bRes.data,
        drivers: dRes.data,
        vehicles: vRes.data,   // expose ALL vehicles (admin needs in-use ones too)
        loading: false,
      });
    } catch (err) {
      console.error('Failed to load data from backend:', err);
      set({ loading: false });
    }
  },
}));
