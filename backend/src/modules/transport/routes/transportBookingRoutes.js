const express = require('express');
const router = express.Router();
const transportBookingController = require('../controllers/transportBookingController');

router.get('/', transportBookingController.getAllBookings);
router.post('/', transportBookingController.createBooking);
router.put('/:id/status', transportBookingController.updateBookingStatus);
router.put('/:id/assign', transportBookingController.assignBooking);
router.put('/:id', transportBookingController.updateBooking);
router.delete('/:id', transportBookingController.deleteBooking);

module.exports = router;
