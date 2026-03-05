import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Guest } from '../types';

interface AuthState {
    guest: Guest | null;
    setGuest: (guest: Guest | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            guest: null,
            setGuest: (guest) => set({ guest }),
            logout: () => set({ guest: null }),
        }),
        {
            name: 'auth-storage', // Key for localStorage
        }
    )
);
