import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const HOTELS_URL = `${API_BASE}/hotels`;
const BOOKINGS_URL = `${API_BASE}/bookings`;
const TRANSPORT_URL = `${API_BASE}/transport`;

export const searchHotels = (params) => axios.get(`${HOTELS_URL}/search`, { params });
export const getHotelDetails = (id) => axios.get(`${HOTELS_URL}/${id}`);
export const validateAndQuote = (quoteData) => axios.post(`${BOOKINGS_URL}/validate-quote`, quoteData);
export const createHold = (holdData) => axios.post(`${BOOKINGS_URL}/hold`, holdData);
export const checkoutBooking = (id, paymentData) => axios.post(`${BOOKINGS_URL}/${id}/checkout`, paymentData);
export const cancelBooking = (id) => axios.post(`${BOOKINGS_URL}/${id}/cancel`);
export const getMyTrips = (userId) => axios.get(`${BOOKINGS_URL}/my-trips`, { params: { userId } });

// Transport
export const estimateTransportCost = (data) => axios.post(`${TRANSPORT_URL}/estimate`, data);
export const createTransport = (data) => axios.post(TRANSPORT_URL, data);
export const getUserTransports = (userId) => axios.get(`${TRANSPORT_URL}/user/${userId}`);
