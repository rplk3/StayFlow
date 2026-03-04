const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomType: { type: String, required: true, unique: true },
    totalRooms: { type: Number, required: true },
    basePrice: { type: Number, required: true }
});

module.exports = mongoose.model('Room', roomSchema);
