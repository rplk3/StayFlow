const express = require('express');
const router = express.Router();
const c = require('../controllers/eventHallController');

// Public: Halls
router.get('/', c.listHalls);
router.get('/:id', c.getHallById);
router.post('/check-availability', c.checkAvailability);
router.post('/quote', c.getQuote);

// Public: Bookings (checkout flow)
router.post('/bookings/hold', c.createHold);
router.post('/bookings/:id/checkout', c.checkout);
router.get('/bookings/user/:userId', c.getUserBookings);
router.put('/bookings/:id', c.modifyBooking);
router.post('/bookings/:id/cancel', c.cancelBooking);

// Admin: Halls
router.get('/admin/halls', c.adminListHalls);
router.post('/admin/halls', c.createHall);
router.put('/admin/halls/:id', c.updateHall);
router.delete('/admin/halls/:id', c.deleteHall);

// Admin: Bookings
router.get('/admin/bookings', c.adminListBookings);
router.get('/admin/bookings/:id', c.adminGetBooking);
router.put('/admin/bookings/:id/approve', c.approveBooking);
router.put('/admin/bookings/:id/reject', c.rejectBooking);
router.put('/admin/bookings/:id/cancel', c.adminCancelBooking);
router.put('/admin/bookings/:id/complete', c.completeBooking);

module.exports = router;
