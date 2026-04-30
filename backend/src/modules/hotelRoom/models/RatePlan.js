const mongoose = require('mongoose');

const ratePlanSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    name: { type: String, required: true }, // e.g. "Non-Refundable", "Standard Rate"
    paymentType: { type: String, enum: ['PAY_NOW', 'PAY_LATER'], required: true },
    // Multiplier against room's basePrice, or absolute adjustment
    priceMultiplier: { type: Number, default: 1.0 }, 
    cancellationPolicy: {
        isRefundable: { type: Boolean, default: true },
        freeCancellationDaysPrior: { type: Number, default: 0 }, // days before check-in
        penaltyPercentage: { type: Number, default: 0 } // e.g. 100 for no refund, 50 for half refund after deadline
    },
    includesBreakfast: { type: Boolean, default: false }
});

module.exports = mongoose.model('RatePlan', ratePlanSchema);
