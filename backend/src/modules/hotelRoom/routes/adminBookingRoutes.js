const express = require('express');
const router = express.Router();
const adminBookingController = require('../controllers/adminBookingController');
const { protect } = require('../../../middleware/authMiddleware');

router.use(protect);

router.get('/', adminBookingController.getAllBookings);
router.get('/:id', adminBookingController.getBookingById);
router.put('/:id/status', adminBookingController.updateBookingStatus);
router.delete('/:id', adminBookingController.deleteBooking);

module.exports = router;
