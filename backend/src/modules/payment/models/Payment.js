const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { type: Number, required: true },
    paymentStatus: {
        type: String,
        enum: ['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'],
        default: 'SUCCESS'
    },
    refundAmount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
