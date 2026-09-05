const express = require('express');
const router = express.Router();
const driverAuthController = require('../controllers/driverAuthController');
const { protectDriver } = require('../../../middleware/driverAuthMiddleware');

router.post('/register', driverAuthController.registerDriver);
router.post('/login', driverAuthController.loginDriver);

router.get('/my-bookings', protectDriver, driverAuthController.getMyBookings);
router.put('/bookings/:id/status', protectDriver, driverAuthController.updateTripStatus);

module.exports = router;
