const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    destination: { type: String, required: true },
    description: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    phone: { type: String },
    email: { type: String },
    starRating: { type: Number, min: 1, max: 5 },
    priceRange: { type: String, enum: ['budget', 'mid-range', 'luxury', 'ultra-luxury'], default: 'mid-range' },
    amenities: [{ type: String }],
    images: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hotel', hotelSchema);
