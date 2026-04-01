const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // e.g. "guest123" or email
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    ratePlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'RatePlan' },
    guestDetails: {
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String },
        phone: { type: String }
    },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    guests: { type: Number, default: 1 },
    nights: { type: Number, required: true },
    
    pricing: {
        roomTotal: { type: Number, required: true },
        taxesFees: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        dueNow: { type: Number, required: true },
        dueAtHotel: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: ['HOLD', 'CONFIRMED', 'FORWARDED', 'CANCELLED', 'NO_SHOW'],
        default: 'HOLD'
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID_IN_FULL', 'PARTIAL_AT_HOTEL', 'REFUNDED', 'PENALTY_CHARGED'],
        default: 'PENDING'
    },
    bookingCode: { type: String, unique: true }, // itinerary code
    cancellationDetails: {
        cancelledAt: Date,
        penaltyAmount: { type: Number, default: 0 },
        refundAmount: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
