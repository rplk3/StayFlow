const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true },
    description: { type: String, default: '' },
    capacity: { type: Number, required: true, min: 1 },
    priceModel: { type: String, required: true, enum: ['PER_HOUR', 'FIXED'] },
    pricePerHour: { type: Number, default: 0 },
    fixedPrice: { type: Number, default: 0 },
    facilities: [{ type: String, trim: true }],
    images: [{ type: String }],
    rules: { type: String, default: '' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

hallSchema.pre('validate', function (next) {
    if (this.priceModel === 'PER_HOUR' && (!this.pricePerHour || this.pricePerHour <= 0)) {
        return next(new Error('pricePerHour is required when priceModel is PER_HOUR'));
    }
    if (this.priceModel === 'FIXED' && (!this.fixedPrice || this.fixedPrice <= 0)) {
        return next(new Error('fixedPrice is required when priceModel is FIXED'));
    }
    next();
});

hallSchema.pre('save', function (next) {
    if (!this.slug && this.name) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Hall', hallSchema);
