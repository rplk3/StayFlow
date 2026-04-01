const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, required: true },
    bookingType: { type: String, enum: ['room', 'event'], required: true },
    userId: { type: String, required: true },
    refundAmount: { type: Number, required: true },
    refundReason: { type: String, required: true },
    refundStatus: {
        type: String,
        enum: ['requested', 'approved', 'processed', 'rejected'],
        default: 'requested'
    },
    adminNote: { type: String },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date }
});

module.exports = mongoose.model('Refund', refundSchema);
