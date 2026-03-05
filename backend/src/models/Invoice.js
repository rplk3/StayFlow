const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNo: {
            type: String,
            required: true,
            unique: true,
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
        },
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        issueDate: {
            type: Date,
            default: Date.now,
        },
        lineItems: [
            {
                description: { type: String, required: true },
                qty: { type: Number, required: true, default: 1 },
                unitPrice: { type: Number, required: true },
                total: { type: Number, required: true },
            },
        ],
        totals: {
            subtotal: { type: Number, required: true },
            tax: { type: Number, required: true },
            serviceCharge: { type: Number, required: true },
            discount: { type: Number, default: 0 },
            grandTotal: { type: Number, required: true },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
