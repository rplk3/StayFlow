const express = require('express');
const router = express.Router();
const c = require('../controllers/paymentController');

// User endpoints
router.post('/process', c.processPayment);
router.get('/booking/:bookingId', c.getPaymentByBooking);
router.get('/user/:userId', c.getUserPayments);
router.post('/:id/refund', c.requestRefund);
router.get('/:id/invoice', c.getInvoice);
router.get('/:id/invoice/pdf', c.downloadInvoicePdf);

// Admin endpoints
router.get('/admin/all', c.adminGetAllPayments);
router.get('/admin/refunds', c.adminGetAllRefunds);
router.get('/admin/:id', c.adminGetPayment);
router.put('/admin/:id/status', c.adminUpdatePaymentStatus);
router.put('/admin/:id/verify', c.adminVerifyPayment);
router.post('/admin/:id/generate-invoice', c.adminGenerateInvoice);
router.put('/admin/refunds/:id/process', c.adminProcessRefund);

module.exports = router;
