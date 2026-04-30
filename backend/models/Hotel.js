const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, required: true },
  starRating: { type: Number, required: true, min: 1, max: 5 },
  images: [{ type: String }],
  amenities: [{ type: String }],
  pricePerNight: { type: Number, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Hotel', hotelSchema);
