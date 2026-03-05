const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getBookingById,
    updateBooking,
    cancelBooking
} = require('../controllers/bookingController');

router.post('/', createBooking);
router.get('/me', getMyBookings);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
