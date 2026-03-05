const express = require('express');
const router = express.Router();
const { getInvoicesByBooking, getInvoiceById, downloadInvoicePDF } = require('../controllers/invoiceController');

router.get('/by-booking/:bookingId', getInvoicesByBooking);
router.get('/:invoiceId/pdf', downloadInvoicePDF);
router.get('/:invoiceId', getInvoiceById);

module.exports = router;
