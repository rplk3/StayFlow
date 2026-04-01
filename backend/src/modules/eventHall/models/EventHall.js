const mongoose = require('mongoose');

const eventHallSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    capacity: {
        min: { type: Number, default: 10 },
        max: { type: Number, required: true }
    },
    facilities: [{ type: String }],
    images: [{ type: String }],
    pricePerHour: { type: Number, required: true },
    pricePerDay: { type: Number },
    eventTypes: [{ type: String }], // wedding, conference, birthday, etc.
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EventHall', eventHallSchema);
