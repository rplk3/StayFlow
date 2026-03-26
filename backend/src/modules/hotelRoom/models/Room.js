const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomNumber: { type: String },
    roomType: { type: String, required: true },
    capacity: { type: Number, default: 2 },
    floor: { type: Number },
    description: { type: String },
    amenities: [{ type: String }],
    images: [{ type: String }],
    totalRooms: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    status: { type: String, enum: ['available', 'occupied', 'maintenance', 'unavailable'], default: 'available' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
