const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: 'LKR',
        },
        method: {
            type: String,
            default: 'CARD',
        },
        gateway: {
            type: String,
            default: 'MOCK_GATEWAY',
        },
        transactionRef: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'],
            default: 'PENDING',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Payment', paymentSchema);
