const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');

// Public routes (used during checkout)
router.post('/estimate', transportController.estimateCost);
router.post('/', transportController.createTransport);
router.get('/booking/:bookingId', transportController.getTransportByBooking);

// Admin routes
router.get('/', transportController.getAllTransports);
router.put('/:id/status', transportController.updateTransportStatus);

module.exports = router;
