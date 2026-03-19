const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    destination: { type: String, required: true },
    description: { type: String },
    starRating: { type: Number, min: 1, max: 5 },
    amenities: [{ type: String }],
    images: [{ type: String }], // Array of image URLs
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hotel', hotelSchema);
