const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Refund = require('../models/Refund');

const processRefund = async (req, res) => {
    try {
        const { paymentId, amount, reason } = req.body;

        if (!paymentId || !amount || !reason) {
            return res.status(400).json({ message: 'Missing required refund details' });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        if (amount > payment.amount) {
            return res.status(400).json({ message: 'Refund amount cannot exceed payment amount' });
        }

        const booking = await Booking.findById(payment.bookingId);

        // Create refund record
        const refund = await Refund.create({
            paymentId: payment._id,
            bookingId: payment.bookingId,
            amount,
            reason
        });

        if (Number(amount) === Number(payment.amount)) {
            payment.status = 'REFUNDED';
            if (booking) booking.paymentStatus = 'REFUNDED';
        } else {
            payment.status = 'PARTIALLY_REFUNDED';
            if (booking) booking.paymentStatus = 'PARTIALLY_REFUNDED';
        }

        await payment.save();
        if (booking) await booking.save();

        res.json({ refund, payment, booking });
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({ message: 'Error processing refund' });
    }
};

const getAdminRefunds = async (req, res) => {
    try {
        const { from, to, q } = req.query;

        let query = {};
        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) query.createdAt.$lte = new Date(to);
        }

        let refunds = await Refund.find(query).sort({ createdAt: -1 }).populate('paymentId bookingId');

        if (q) {
            const lowerQ = q.toLowerCase();
            refunds = refunds.filter(r =>
                (r.reason && r.reason.toLowerCase().includes(lowerQ)) ||
                (r.paymentId && r.paymentId.transactionRef && r.paymentId.transactionRef.toLowerCase().includes(lowerQ))
            );
        }

        res.json(refunds);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching refunds' });
    }
};

module.exports = {
    processRefund,
    getAdminRefunds
};
