import axios from 'axios';
import type { Booking, Driver, Vehicle, Guest, LoginData, RegisterData } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('auth-storage');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        const token = parsed?.state?.guest?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        // ignore
      }
    }
  }
  return config;
});

export const getDrivers = () => api.get<Driver[]>('/drivers');
export const getVehicles = () => api.get<Vehicle[]>('/vehicles');
export const getBookings = () => api.get<Booking[]>('/bookings');

export const createBooking = (data: any) => api.post('/bookings', data);
export const updateBookingStatus = (id: string, status: string) => api.put(`/bookings/${id}/status`, { status });
export const assignBooking = (id: string, data: { driverId: string; vehicleId: string }) => api.put(`/bookings/${id}/assign`, data);

// Drivers CRUD
export const createDriver = (data: any) => api.post('/drivers', data);
export const updateDriver = (id: string, data: any) => api.put(`/drivers/${id}`, data);
export const deleteDriver = (id: string) => api.delete(`/drivers/${id}`);

// Vehicles CRUD
export const createVehicle = (data: any) => api.post('/vehicles', data);
export const updateVehicle = (id: string, data: any) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id: string) => api.delete(`/vehicles/${id}`);

// Auth endpoints
export const loginGuest = (data: LoginData) => api.post<Guest>('/auth/login', data);
export const registerGuest = (data: RegisterData) => api.post<Guest>('/auth/register', data);
export const getMyProfile = () => api.get<Guest>('/auth/profile');

export default api;
