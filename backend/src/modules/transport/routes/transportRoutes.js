const express = require('express');
const router = express.Router();
const tc = require('../controllers/transportController');

// Public routes (checkout & user)
router.post('/estimate', tc.estimateCost);
router.post('/', tc.createTransport);
router.get('/booking/:bookingId', tc.getTransportByBooking);
router.get('/user/:userId', tc.getUserTransports);

// Admin routes
router.get('/', tc.getAllTransports);
router.get('/:id', tc.getTransportById);
router.put('/:id', tc.updateTransport);
router.delete('/:id', tc.deleteTransport);
router.put('/:id/approve', tc.approveTransport);
router.put('/:id/reject', tc.rejectTransport);
router.put('/:id/cancel', tc.cancelTransport);
router.put('/:id/complete', tc.completeTransport);
router.put('/:id/assign', tc.assignTransport);
router.put('/:id/forward', tc.forwardToCompany);

module.exports = router;
