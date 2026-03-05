const mongoose = require('mongoose');

const hallBlockSchema = new mongoose.Schema({
    hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true, match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:MM format'] },
    endTime: { type: String, required: true, match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Use HH:MM format'] },
    reason: { type: String, default: 'maintenance' }
}, { timestamps: true });

module.exports = mongoose.model('HallBlock', hallBlockSchema);
