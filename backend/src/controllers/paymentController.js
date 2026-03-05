const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { processMockPayment } = require('../services/mockGatewayService');

const processPayment = async (req, res) => {
    try {
        const { bookingId, card } = req.body;

        if (!bookingId || !card || !card.number) {
            return res.status(400).json({ message: 'Booking ID and valid card details are required' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.paymentStatus === 'PAID') {
            return res.status(400).json({ message: 'Booking is already paid' });
        }

        // Process payment via mock gateway
        const amount = booking.billing.total;
        const gatewayResult = processMockPayment(card.number, amount);

        // Create payment record
        const payment = await Payment.create({
            bookingId: booking._id,
            userId: booking.userId,
            amount: gatewayResult.amount,
            transactionRef: gatewayResult.transactionRef,
            status: gatewayResult.status
        });

        let invoice = null;

        if (gatewayResult.status === 'SUCCESS') {
            booking.paymentStatus = 'PAID';
            booking.bookingStatus = 'CONFIRMED';
            await booking.save();

            // Create Invoice line items
            const lineItems = [
                {
                    description: `Room charge (${booking.nights} nights @ LKR ${booking.basePricePerNight})`,
                    qty: booking.nights,
                    unitPrice: booking.basePricePerNight,
                    total: booking.nights * booking.basePricePerNight
                }
            ];

            booking.extras.forEach(extra => {
                lineItems.push({
                    description: `Extra: ${extra.name}`,
                    qty: 1,
                    unitPrice: extra.price,
                    total: extra.price
                });
            });

            // Generate invoice
            invoice = await Invoice.create({
                invoiceNo: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                bookingId: booking._id,
                paymentId: payment._id,
                userId: booking.userId,
                lineItems,
                totals: booking.billing
            });
        } else if (gatewayResult.status === 'PENDING') {
            booking.paymentStatus = 'PENDING';
            await booking.save();
        } else {
            booking.paymentStatus = 'UNPAID';
            // keep bookingStatus as PENDING
            await booking.save();
        }

        res.json({ payment, booking, invoice });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Server error processing payment' });
    }
};

const getPaymentsByBooking = async (req, res) => {
    try {
        const payments = await Payment.find({ bookingId: req.params.bookingId }).sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments' });
    }
};

const getMyPayments = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const payments = await Payment.find({ userId }).sort({ createdAt: -1 }).populate('bookingId');
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching personal payments' });
    }
};

const getAdminPayments = async (req, res) => {
    try {
        const { status, from, to, q } = req.query;

        let query = {};
        if (status) query.status = status;

        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) query.createdAt.$lte = new Date(to);
        }

        let payments = await Payment.find(query).sort({ createdAt: -1 }).populate('bookingId');

        // Simple text search filter on robust data
        if (q) {
            const lowerQ = q.toLowerCase();
            payments = payments.filter(p =>
                (p.transactionRef && p.transactionRef.toLowerCase().includes(lowerQ)) ||
                (p.userId && String(p.userId).toLowerCase().includes(lowerQ)) ||
                (p.bookingId && p.bookingId._id && String(p.bookingId._id).toLowerCase().includes(lowerQ))
            );
        }

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin payments' });
    }
};

module.exports = {
    processPayment,
    getPaymentsByBooking,
    getMyPayments,
    getAdminPayments
};
