const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Refund = require('../models/Refund');

// Helper: generate invoice number
const generateInvoiceNumber = () => {
    const prefix = 'INV';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
};

// Helper: generate transaction reference
const generateTransactionRef = () => {
    return 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// ==================== USER ENDPOINTS ====================

// POST /api/payments/process — Process payment (sandbox)
exports.processPayment = async (req, res) => {
    try {
        const { bookingId, bookingType, userId, amount, taxAmount, serviceCharge, totalAmount, paymentMethod, cardDetails } = req.body;

        if (!bookingId || !bookingType || !userId || !totalAmount) {
            return res.status(400).json({ message: 'bookingId, bookingType, userId, and totalAmount are required' });
        }

        // Sandbox: simulate payment processing (always succeed in dev)
        const isSuccess = true;
        const transactionReference = generateTransactionRef();

        const payment = await Payment.create({
            bookingId,
            bookingType,
            userId,
            amount: amount || totalAmount,
            taxAmount: taxAmount || 0,
            serviceCharge: serviceCharge || 0,
            totalAmount,
            paymentMethod: paymentMethod || 'sandbox',
            paymentStatus: isSuccess ? 'paid' : 'failed',
            transactionReference,
            paidAt: isSuccess ? new Date() : null
        });

        // Auto-generate invoice on success
        let invoice = null;
        if (isSuccess) {
            invoice = await Invoice.create({
                paymentId: payment._id,
                bookingId,
                bookingType,
                invoiceNumber: generateInvoiceNumber(),
                invoiceDate: new Date(),
                subtotal: amount || totalAmount,
                taxAmount: taxAmount || 0,
                serviceCharge: serviceCharge || 0,
                totalAmount
            });
        }

        res.json({
            success: isSuccess,
            payment,
            invoice,
            message: isSuccess ? 'Payment processed successfully' : 'Payment failed. Please try again.'
        });
    } catch (err) {
        res.status(500).json({ message: 'Payment processing failed', error: err.message });
    }
};

// GET /api/payments/booking/:bookingId — Get payment + invoice for a booking
exports.getPaymentByBooking = async (req, res) => {
    try {
        const payment = await Payment.findOne({ bookingId: req.params.bookingId });
        if (!payment) return res.status(404).json({ message: 'No payment found for this booking' });

        const invoice = await Invoice.findOne({ paymentId: payment._id });
        const refund = await Refund.findOne({ paymentId: payment._id });

        res.json({ payment, invoice, refund });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/payments/user/:userId — All payments for a user
exports.getUserPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.params.userId }).sort({ createdAt: -1 });

        // Attach invoices and refunds
        const result = await Promise.all(payments.map(async (p) => {
            const invoice = await Invoice.findOne({ paymentId: p._id });
            const refund = await Refund.findOne({ paymentId: p._id });
            return { payment: p, invoice, refund };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/payments/:id/refund — Request refund (user)
exports.requestRefund = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        if (payment.paymentStatus !== 'paid') return res.status(400).json({ message: 'Only paid payments can be refunded' });

        // Check if refund already exists
        const existing = await Refund.findOne({ paymentId: payment._id });
        if (existing) return res.status(400).json({ message: 'Refund already requested', refund: existing });

        const { refundReason } = req.body;
        const refund = await Refund.create({
            paymentId: payment._id,
            bookingId: payment.bookingId,
            bookingType: payment.bookingType,
            userId: payment.userId,
            refundAmount: payment.totalAmount,
            refundReason: refundReason || 'Customer requested refund',
            refundStatus: 'requested'
        });

        res.json({ message: 'Refund requested successfully', refund });
    } catch (err) {
        res.status(500).json({ message: 'Refund request failed', error: err.message });
    }
};

// GET /api/payments/:id/invoice — Get invoice for a payment
exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({ paymentId: req.params.id }).populate('paymentId');
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/payments/:id/invoice/pdf — Download PDF invoice
exports.downloadInvoicePdf = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        const invoice = await Invoice.findOne({ paymentId: payment._id });
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.invoiceNumber}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('StayFlow', 50, 50);
        doc.fontSize(10).font('Helvetica').fillColor('#666').text('Hotel & Event Management', 50, 78);
        doc.moveDown(0.5);
        doc.strokeColor('#003B95').lineWidth(2).moveTo(50, 100).lineTo(545, 100).stroke();

        // Invoice details (right-aligned)
        doc.fontSize(18).font('Helvetica-Bold').fillColor('#003B95').text('INVOICE', 400, 50, { align: 'right' });
        doc.fontSize(10).font('Helvetica').fillColor('#333');
        doc.text(`Invoice #: ${invoice.invoiceNumber}`, 350, 75, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 350, 90, { align: 'right' });

        // Booking info
        let y = 120;
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#333').text('Booking Details', 50, y);
        y += 20;
        doc.fontSize(10).font('Helvetica').fillColor('#555');
        doc.text(`Booking Type: ${payment.bookingType === 'room' ? 'Room Booking' : 'Event Hall Booking'}`, 50, y); y += 16;
        doc.text(`Transaction Ref: ${payment.transactionReference}`, 50, y); y += 16;
        doc.text(`Payment Method: ${payment.paymentMethod || 'Sandbox'}`, 50, y); y += 16;
        doc.text(`Payment Status: ${payment.paymentStatus.toUpperCase()}`, 50, y); y += 16;
        doc.text(`User ID: ${payment.userId}`, 50, y); y += 30;

        // Table header
        doc.strokeColor('#ddd').lineWidth(1).moveTo(50, y).lineTo(545, y).stroke();
        y += 8;
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#333');
        doc.text('Description', 50, y, { width: 250 });
        doc.text('Amount', 400, y, { width: 145, align: 'right' });
        y += 18;
        doc.strokeColor('#ddd').lineWidth(0.5).moveTo(50, y).lineTo(545, y).stroke();
        y += 10;

        // Line items
        doc.font('Helvetica').fillColor('#444');
        doc.text(payment.bookingType === 'room' ? 'Room Charges' : 'Event Hall Charges', 50, y, { width: 250 });
        doc.text(`Rs. ${(payment.amount || 0).toLocaleString()}`, 400, y, { width: 145, align: 'right' });
        y += 22;

        if (payment.taxAmount > 0) {
            doc.text('Taxes & Fees', 50, y, { width: 250 });
            doc.text(`Rs. ${payment.taxAmount.toLocaleString()}`, 400, y, { width: 145, align: 'right' });
            y += 22;
        }

        if (payment.serviceCharge > 0) {
            doc.text('Service Charge', 50, y, { width: 250 });
            doc.text(`Rs. ${payment.serviceCharge.toLocaleString()}`, 400, y, { width: 145, align: 'right' });
            y += 22;
        }

        // Total line
        y += 5;
        doc.strokeColor('#003B95').lineWidth(1.5).moveTo(300, y).lineTo(545, y).stroke();
        y += 10;
        doc.fontSize(13).font('Helvetica-Bold').fillColor('#003B95');
        doc.text('Total', 300, y, { width: 100 });
        doc.text(`Rs. ${payment.totalAmount.toLocaleString()}`, 400, y, { width: 145, align: 'right' });

        // Footer
        y += 60;
        doc.fontSize(9).font('Helvetica').fillColor('#999');
        doc.text('This is a system-generated invoice. No signature is required.', 50, y, { align: 'center', width: 495 });
        doc.text('Thank you for choosing StayFlow!', 50, y + 15, { align: 'center', width: 495 });

        doc.end();
    } catch (err) {
        res.status(500).json({ message: 'PDF generation failed', error: err.message });
    }
};

// ==================== ADMIN ENDPOINTS ====================

// GET /api/payments/admin/all — All payments with filters
exports.adminGetAllPayments = async (req, res) => {
    try {
        const { status, bookingType, search, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
        let query = {};

        if (status) query.paymentStatus = status;
        if (bookingType) query.bookingType = bookingType;
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }
        if (search) {
            query.$or = [
                { transactionReference: { $regex: search, $options: 'i' } },
                { userId: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Payment.countDocuments(query);
        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        // Attach invoices and refunds
        const result = await Promise.all(payments.map(async (p) => {
            const invoice = await Invoice.findOne({ paymentId: p._id });
            const refund = await Refund.findOne({ paymentId: p._id });
            return { payment: p, invoice, refund };
        }));

        res.json({ payments: result, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/payments/admin/:id — Payment detail
exports.adminGetPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        const invoice = await Invoice.findOne({ paymentId: payment._id });
        const refund = await Refund.findOne({ paymentId: payment._id });

        res.json({ payment, invoice, refund });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/payments/admin/:id/status — Update payment status
exports.adminUpdatePaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        const { paymentStatus } = req.body;
        if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        payment.paymentStatus = paymentStatus;
        if (paymentStatus === 'paid' && !payment.paidAt) payment.paidAt = new Date();
        await payment.save();

        res.json({ message: 'Payment status updated', payment });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/payments/admin/:id/verify — Verify payment
exports.adminVerifyPayment = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        // Mark as verified (paid)
        payment.paymentStatus = 'paid';
        if (!payment.paidAt) payment.paidAt = new Date();
        await payment.save();

        res.json({ message: 'Payment verified', payment });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/payments/admin/:id/generate-invoice — Generate/regenerate invoice
exports.adminGenerateInvoice = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        // Cancel existing invoice if any
        await Invoice.updateMany({ paymentId: payment._id }, { invoiceStatus: 'cancelled' });

        const invoice = await Invoice.create({
            paymentId: payment._id,
            bookingId: payment.bookingId,
            bookingType: payment.bookingType,
            invoiceNumber: generateInvoiceNumber(),
            invoiceDate: new Date(),
            subtotal: payment.amount,
            taxAmount: payment.taxAmount,
            serviceCharge: payment.serviceCharge,
            totalAmount: payment.totalAmount
        });

        res.json({ message: 'Invoice generated', invoice });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/payments/admin/refunds — List all refunds
exports.adminGetAllRefunds = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = {};
        if (status) query.refundStatus = status;

        const total = await Refund.countDocuments(query);
        const refunds = await Refund.find(query)
            .populate('paymentId')
            .sort({ requestedAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.json({ refunds, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/payments/admin/refunds/:id/process — Process refund
exports.adminProcessRefund = async (req, res) => {
    try {
        const refund = await Refund.findById(req.params.id);
        if (!refund) return res.status(404).json({ message: 'Refund not found' });

        const { action, adminNote } = req.body; // action: 'approve', 'reject', 'process'

        if (action === 'approve') {
            refund.refundStatus = 'approved';
        } else if (action === 'reject') {
            refund.refundStatus = 'rejected';
        } else if (action === 'process') {
            refund.refundStatus = 'processed';
            refund.processedAt = new Date();

            // Update payment status
            const payment = await Payment.findById(refund.paymentId);
            if (payment) {
                payment.paymentStatus = 'refunded';
                await payment.save();
            }
        } else {
            return res.status(400).json({ message: 'Invalid action. Use approve, reject, or process' });
        }

        if (adminNote) refund.adminNote = adminNote;
        await refund.save();

        res.json({ message: `Refund ${action}d successfully`, refund });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
