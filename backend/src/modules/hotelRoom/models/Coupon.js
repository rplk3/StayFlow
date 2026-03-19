const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    maxDiscountAmount: { type: Number },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Coupon', couponSchema);
