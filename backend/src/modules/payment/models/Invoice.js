const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, required: true },
    bookingType: { type: String, enum: ['room', 'event'], required: true },
    invoiceNumber: { type: String, unique: true, required: true },
    invoiceDate: { type: Date, default: Date.now },
    subtotal: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    serviceCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    invoiceStatus: {
        type: String,
        enum: ['generated', 'cancelled'],
        default: 'generated'
    }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
