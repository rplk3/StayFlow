import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Halls
export const getHalls = (params) => API.get('/halls', { params });
export const getHallById = (id) => API.get(`/halls/${id}`);
export const createHall = (data) => API.post('/halls', data);
export const updateHall = (id, data) => API.put(`/halls/${id}`, data);
export const deleteHall = (id) => API.delete(`/halls/${id}`);
export const checkAvailability = (hallId, data) => API.post(`/halls/${hallId}/check-availability`, data);

// Customer Bookings
export const createBooking = (data) => API.post('/event-bookings', data);
export const getMyBookings = (userId) => API.get('/event-bookings/me', { params: { userId } });
export const getBookingById = (id) => API.get(`/event-bookings/${id}`);
export const updateBooking = (id, data) => API.put(`/event-bookings/${id}`, data);
export const cancelBooking = (id) => API.patch(`/event-bookings/${id}/cancel`);

// Admin Bookings
export const getAdminBookings = (params) => API.get('/admin/event-bookings', { params });
export const approveBooking = (id, data) => API.patch(`/admin/event-bookings/${id}/approve`, data);
export const rejectBooking = (id, data) => API.patch(`/admin/event-bookings/${id}/reject`, data);
export const adminCancelBooking = (id, data) => API.patch(`/admin/event-bookings/${id}/cancel`, data);
export const getBookingStats = (params) => API.get('/admin/event-bookings/stats', { params });

export default API;
