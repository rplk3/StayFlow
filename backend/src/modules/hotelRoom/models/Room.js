const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomType: { type: String, required: true },
    capacity: { type: Number, default: 2 },
    amenities: [{ type: String }],
    images: [{ type: String }],
    totalRooms: { type: Number, required: true },
    basePrice: { type: Number, required: true }
});

module.exports = mongoose.model('Room', roomSchema);
