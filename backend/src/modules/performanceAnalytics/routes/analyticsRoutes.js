const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Daily aggregation
router.post('/rebuild-daily', analyticsController.rebuildDaily);

// Dashboard data
router.get('/dashboard', analyticsController.getDashboard);

// Forecasting
router.get('/forecast', analyticsController.getForecast);

// Anomaly detection
router.post('/check-anomalies', analyticsController.checkAnomalies);

// Alerts
router.get('/alerts', analyticsController.getAlerts);
router.patch('/alerts/:id/resolve', analyticsController.resolveAlert);

// Conversational BI Chatbot
router.post('/chat', analyticsController.handleChatQuery);

// Temporary debug route - inspect booking pricing
router.get('/debug-pricing', async (req, res) => {
    try {
        const Booking = require('../../hotelRoom/models/Booking');
        const EventBooking = require('../../eventHall/models/EventBooking');
        
        // Get sample hotel bookings with pricing
        const sampleHotel = await Booking.find({}, { pricing: 1, status: 1, createdAt: 1 }).limit(3).lean();
        
        // Get sample event bookings with pricing
        const sampleEvent = await EventBooking.find({}, { pricing: 1, status: 1, createdAt: 1 }).limit(3).lean();
        
        // Aggregate total revenue from all non-cancelled hotel bookings
        const hotelRevAll = await Booking.aggregate([
            { $match: { status: { $ne: 'CANCELLED' } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalAmount' }, count: { $sum: 1 } } }
        ]);
        
        // Aggregate total revenue from all non-cancelled event bookings
        const eventRevAll = await EventBooking.aggregate([
            { $match: { status: { $ne: 'CANCELLED' } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalAmount' }, count: { $sum: 1 } } }
        ]);
        
        res.json({
            sampleHotelBookings: sampleHotel,
            sampleEventBookings: sampleEvent,
            hotelRevenueAgg: hotelRevAll,
            eventRevenueAgg: eventRevAll
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
