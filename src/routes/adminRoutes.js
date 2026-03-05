const express = require('express');
const router = express.Router();
const {
    getAllBookings,
    approveBooking,
    rejectBooking,
    adminCancelBooking,
    getBookingStats
} = require('../controllers/adminBookingController');

router.get('/event-bookings', getAllBookings);
router.get('/event-bookings/stats', getBookingStats);
router.patch('/event-bookings/:id/approve', approveBooking);
router.patch('/event-bookings/:id/reject', rejectBooking);
router.patch('/event-bookings/:id/cancel', adminCancelBooking);

module.exports = router;
