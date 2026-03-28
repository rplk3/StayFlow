const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const analyticsRoutes = require('./modules/performanceAnalytics/routes/analyticsRoutes');
const reportRoutes = require('./modules/performanceAnalytics/routes/reportRoutes');

const hotelRoutes = require('./modules/hotelRoom/routes/hotelRoutes');
const adminHotelRoutes = require('./modules/hotelRoom/routes/adminHotelRoutes');
const adminRoomRoutes = require('./modules/hotelRoom/routes/adminRoomRoutes');
const bookingRoutes = require('./modules/hotelRoom/routes/bookingRoutes');
const transportRoutes = require('./modules/transport/routes/transportRoutes');
const eventHallRoutes = require('./modules/eventHall/routes/eventHallRoutes');
const authRoutes = require('./modules/auth/routes/authRoutes');
const paymentRoutes = require('./modules/payment/routes/paymentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/admin/hotels', adminHotelRoutes);
app.use('/api/admin/rooms', adminRoomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/event-halls', eventHallRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;
