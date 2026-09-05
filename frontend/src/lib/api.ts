import axios from 'axios';
import type { Booking, Driver, Vehicle, Guest, LoginData, RegisterData, DriverAuth, DriverLoginData, DriverRegisterData, PendingDriver } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Check for driver token first
    const driverData = localStorage.getItem('driver-auth-storage');
    if (driverData) {
      try {
        const parsed = JSON.parse(driverData);
        const token = parsed?.state?.driver?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      } catch (err) {
        // ignore
      }
    }

    // Fall back to guest token
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

// ── Guest Auth ──
export const loginGuest = (data: LoginData) => api.post<Guest>('/auth/login', data);
export const registerGuest = (data: RegisterData) => api.post<Guest>('/auth/register', data);
export const getMyProfile = () => api.get<Guest>('/auth/profile');

// ── Bookings ──
export const getBookings = () => api.get<Booking[]>('/transport-bookings');
export const createBooking = (data: any) => api.post('/transport-bookings', data);
export const updateBookingStatus = (id: string, status: string) => api.put(`/transport-bookings/${id}/status`, { status });
export const assignBooking = (id: string, data: { driverId: string; vehicleId: string }) => api.put(`/transport-bookings/${id}/assign`, data);
export const updateBooking = (id: string, data: any) => api.put(`/transport-bookings/${id}`, data);
export const deleteBooking = (id: string) => api.delete(`/transport-bookings/${id}`);

// ── Drivers CRUD (admin) ──
export const getDrivers = () => api.get<Driver[]>('/drivers');
export const createDriver = (data: any) => api.post('/drivers', data);
export const updateDriver = (id: string, data: any) => api.put(`/drivers/${id}`, data);
export const deleteDriver = (id: string) => api.delete(`/drivers/${id}`);

// ── Vehicles CRUD ──
export const getVehicles = () => api.get<Vehicle[]>('/vehicles');
export const createVehicle = (data: any) => api.post('/vehicles', data);
export const updateVehicle = (id: string, data: any) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id: string) => api.delete(`/vehicles/${id}`);

// ── Driver Auth (driver portal) ──
export const registerDriver = (data: DriverRegisterData) => api.post('/driver-auth/register', data);
export const loginDriver = (data: DriverLoginData) => api.post<DriverAuth>('/driver-auth/login', data);
export const getDriverProfile = () => api.get<DriverAuth>('/driver-auth/profile');
export const getDriverBookings = () => api.get<Booking[]>('/driver-auth/my-bookings');
export const updateDriverTripStatus = (id: string, status: string) => api.put(`/driver-auth/bookings/${id}/status`, { status });

// ── Driver Approval (admin) ──
export const getPendingDrivers = () => api.get<PendingDriver[]>('/drivers/pending');
export const approveDriver = (id: string) => api.put(`/drivers/${id}/approve`);
export const rejectDriver = (id: string) => api.put(`/drivers/${id}/reject`);

export default api;
