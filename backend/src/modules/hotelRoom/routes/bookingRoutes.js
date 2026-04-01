const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Validate inventory, calculate pricing
router.post('/validate-quote', bookingController.validateAndQuote);

// Create temporary hold
router.post('/hold', bookingController.createHold);

// Confirm checkout
router.post('/:id/checkout', bookingController.checkout);

// Cancel booking
router.post('/:id/cancel', bookingController.cancelBooking);

// Get user trips
router.get('/my-trips', bookingController.getUserBookings);

module.exports = router;
