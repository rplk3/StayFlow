const express = require('express');
const router = express.Router(); // Fixed typo here (Router not router)
const { processPayment, getPaymentsByBooking, getMyPayments, getAdminPayments } = require('../controllers/paymentController');

router.post('/process', processPayment);
router.get('/by-booking/:bookingId', getPaymentsByBooking);
router.get('/me', getMyPayments);
router.get('/admin', getAdminPayments);

module.exports = router;
