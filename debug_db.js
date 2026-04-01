const path = require('path');
// Resolve modules from backend's node_modules
module.paths.unshift(path.join(__dirname, 'backend', 'node_modules'));
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const Booking = require('./backend/src/modules/hotelRoom/models/Booking');
    const EventBooking = require('./backend/src/modules/eventHall/models/EventBooking');
    const Payment = require('./backend/src/modules/payment/models/Payment');
    const AnalyticsDaily = require('./backend/src/modules/performanceAnalytics/models/AnalyticsDaily');

    // 1. Count documents
    const hCount = await Booking.countDocuments();
    const eCount = await EventBooking.countDocuments();
    const pCount = await Payment.countDocuments();
    const aCount = await AnalyticsDaily.countDocuments();
    console.log('\n=== DOCUMENT COUNTS ===');
    console.log('Hotel Bookings:', hCount);
    console.log('Event Bookings:', eCount);
    console.log('Payments:', pCount);
    console.log('AnalyticsDaily:', aCount);

    // 2. Hotel booking status breakdown + revenue
    if (hCount > 0) {
        const hAgg = await Booking.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$pricing.totalAmount' } } }
        ]);
        console.log('\n=== HOTEL BOOKING STATUS BREAKDOWN ===');
        console.log(JSON.stringify(hAgg, null, 2));

        // Show a sample booking's pricing
        const sample = await Booking.findOne({}, { pricing: 1, status: 1, createdAt: 1 }).lean();
        console.log('\n=== SAMPLE HOTEL BOOKING ===');
        console.log(JSON.stringify(sample, null, 2));
    }

    // 3. Event booking status breakdown + revenue
    if (eCount > 0) {
        const eAgg = await EventBooking.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$pricing.totalAmount' } } }
        ]);
        console.log('\n=== EVENT BOOKING STATUS BREAKDOWN ===');
        console.log(JSON.stringify(eAgg, null, 2));

        const sample = await EventBooking.findOne({}, { pricing: 1, status: 1, createdAt: 1 }).lean();
        console.log('\n=== SAMPLE EVENT BOOKING ===');
        console.log(JSON.stringify(sample, null, 2));
    }

    // 4. Payment breakdown
    if (pCount > 0) {
        const pAgg = await Payment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$amount' } } }
        ]);
        console.log('\n=== PAYMENT STATUS BREAKDOWN ===');
        console.log(JSON.stringify(pAgg, null, 2));
    }

    // 5. Check AnalyticsDaily for non-zero entries
    const nonZero = await AnalyticsDaily.find({
        $or: [{ totalBookings: { $gt: 0 } }, { totalRevenue: { $gt: 0 } }]
    }).sort({ date: -1 }).limit(5).lean();
    console.log('\n=== ANALYTICS DAILY (non-zero entries) ===');
    console.log(JSON.stringify(nonZero, null, 2));

    await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
