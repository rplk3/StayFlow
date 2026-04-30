const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, required: true },
    bookingType: { type: String, enum: ['room', 'event'], required: true },
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['card', 'sandbox'], default: 'sandbox' },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionReference: { type: String },
    paidAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
