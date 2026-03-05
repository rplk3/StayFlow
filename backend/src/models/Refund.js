const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema(
    {
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            required: true,
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['PROCESSED', 'FAILED'],
            default: 'PROCESSED',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Refund', refundSchema);
