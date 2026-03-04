const mongoose = require('mongoose');

const analyticsDailySchema = new mongoose.Schema({
    date: { type: Date, required: true, unique: true },
    totalRevenue: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    cancelledBookings: { type: Number, default: 0 },
    occupancyRate: { type: Number, default: 0 }
});

module.exports = mongoose.model('AnalyticsDaily', analyticsDailySchema);
