const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
        roomType: {
            type: String,
            required: true,
        },
        checkInDate: {
            type: Date,
            required: true,
        },
        checkOutDate: {
            type: Date,
            required: true,
        },
        nights: {
            type: Number,
            required: true,
            min: 1,
        },
        basePricePerNight: {
            type: Number,
            required: true,
        },
        extras: [
            {
                name: { type: String, required: true },
                price: { type: Number, required: true },
            },
        ],
        billing: {
            subtotal: { type: Number, default: 0 },
            tax: { type: Number, default: 0 },
            serviceCharge: { type: Number, default: 0 },
            discount: { type: Number, default: 0 },
            total: { type: Number, default: 0 },
        },
        bookingStatus: {
            type: String,
            enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
            default: 'PENDING',
        },
        paymentStatus: {
            type: String,
            enum: ['UNPAID', 'PAID', 'PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'],
            default: 'UNPAID',
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Booking', bookingSchema);
