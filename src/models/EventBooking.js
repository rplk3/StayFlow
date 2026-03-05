const mongoose = require('mongoose');

const eventBookingSchema = new mongoose.Schema({
    bookingRef: { type: String, unique: true, required: true },
    userId: { type: String, default: 'guest' },
    customerName: { type: String, required: true, trim: true },
    customerEmail: {
        type: String, required: true, trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    customerPhone: {
        type: String, required: true, trim: true,
        match: [/^[\d\s\-\+\(\)]{7,20}$/, 'Please provide a valid phone number']
    },
    hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
    hallSnapshot: {
        name: String,
        capacity: Number,
        priceModel: String,
        pricePerHour: Number,
        fixedPrice: Number
    },
    eventType: {
        type: String, required: true,
        enum: ['WEDDING', 'MEETING', 'CONFERENCE', 'PARTY', 'OTHER']
    },
    eventDate: { type: Date, required: true },
    startTime: { type: String, required: true, match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:MM format'] },
    endTime: { type: String, required: true, match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:MM format'] },
    durationHours: { type: Number, required: true },
    guestsCount: { type: Number, required: true, min: 1 },
    services: {
        catering: {
            selected: { type: Boolean, default: false },
            pricePerPerson: { type: Number, default: 0 },
            menu: { type: String, default: '' }
        },
        decoration: {
            selected: { type: Boolean, default: false },
            price: { type: Number, default: 0 },
            notes: { type: String, default: '' }
        },
        audioVisual: {
            selected: { type: Boolean, default: false },
            price: { type: Number, default: 0 }
        },
        extraItems: [{
            name: { type: String },
            unitPrice: { type: Number, default: 0 },
            qty: { type: Number, default: 0 }
        }]
    },
    specialRequests: { type: String, default: '' },
    pricing: {
        hallCost: { type: Number, default: 0 },
        servicesCost: { type: Number, default: 0 },
        subtotal: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    status: {
        type: String, default: 'PENDING',
        enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']
    },
    adminDecision: {
        decidedBy: { type: String, default: '' },
        decidedAt: { type: Date },
        reason: { type: String, default: '' },
        adminNotes: { type: String, default: '' },
        finalTotal: { type: Number }
    },
    emailStatus: {
        confirmationSent: { type: Boolean, default: false },
        decisionSent: { type: Boolean, default: false }
    }
}, { timestamps: true });

// Validate startTime < endTime
eventBookingSchema.pre('validate', function (next) {
    if (this.startTime && this.endTime) {
        const [sh, sm] = this.startTime.split(':').map(Number);
        const [eh, em] = this.endTime.split(':').map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;
        if (startMin >= endMin) {
            return next(new Error('startTime must be before endTime'));
        }
    }
    next();
});

module.exports = mongoose.model('EventBooking', eventBookingSchema);
