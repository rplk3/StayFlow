const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    pickupDate: { type: Date, required: true },
    pickupTime: { type: String, required: true },
    pickupAddress: { type: String, required: true },
    pickupCoords: {
        lat: { type: Number },
        lng: { type: Number }
    },
    dropoffAddress: { type: String, required: true },
    dropoffCoords: {
        lat: { type: Number },
        lng: { type: Number }
    },
    vehicleType: {
        type: String,
        enum: ['sedan', 'suv', 'van', 'luxury'],
        required: true
    },
    passengerCount: { type: Number, default: 1 },
    estimatedDistance: { type: Number },
    estimatedCost: { type: Number, required: true },
    specialRequests: { type: String },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected', 'in-transit', 'completed', 'cancelled'],
        default: 'pending'
    },
    // Admin fields
    adminNotes: { type: String },
    rejectionReason: { type: String },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    // Forwarding to transport company
    forwardedToCompany: {
        companyName: { type: String },
        reference: { type: String },
        notes: { type: String },
        forwardedAt: { type: Date }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transport', transportSchema);

