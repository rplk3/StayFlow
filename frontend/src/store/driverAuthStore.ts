import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DriverAuth } from '../types';

interface DriverAuthState {
  driver: DriverAuth | null;
  setDriver: (driver: DriverAuth | null) => void;
  logout: () => void;
}

export const useDriverAuthStore = create<DriverAuthState>()(
  persist(
    (set) => ({
      driver: null,
      setDriver: (driver) => set({ driver }),
      logout: () => set({ driver: null }),
    }),
    {
      name: 'driver-auth-storage',
    }
  )
);
