const mongoose = require('mongoose');

const eventBookingSchema = new mongoose.Schema({
    hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'EventHall', required: true },
    userId: { type: String, required: true },
    // Guest / Booking person details
    guestDetails: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true }
    },
    eventType: { type: String, required: true },
    eventDate: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationHours: { type: Number },
    guestCount: { type: Number, required: true },
    specialNotes: { type: String },
    // Pricing
    pricing: {
        hallCharge: { type: Number, required: true },
        taxesFees: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        dueNow: { type: Number, required: true },
        dueAtVenue: { type: Number, default: 0 }
    },
    bookingCode: { type: String, unique: true },
    status: {
        type: String,
        enum: ['HOLD', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
        default: 'HOLD'
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID_IN_FULL', 'PARTIAL', 'REFUNDED'],
        default: 'PENDING'
    },
    // Admin fields
    confirmationNote: { type: String },
    rejectedReason: { type: String },
    cancellationDetails: {
        cancelledAt: Date,
        reason: String,
        refundAmount: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EventBooking', eventBookingSchema);
