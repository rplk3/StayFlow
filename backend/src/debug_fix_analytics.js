/**
 * Debug + Fix script: Run from project root
 * Usage: node backend/src/debug_fix_analytics.js
 */
const path = require('path');
const backendRoot = path.join(__dirname, '..');
require('dotenv').config({ path: path.join(backendRoot, '.env') });
const mongoose = require('mongoose');

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const Booking = require(path.join(__dirname, '..', 'modules', 'hotelRoom', 'models', 'Booking'));
    const EventBooking = require(path.join(__dirname, '..', 'modules', 'eventHall', 'models', 'EventBooking'));
    const AnalyticsDaily = require(path.join(__dirname, '..', 'modules', 'performanceAnalytics', 'models', 'AnalyticsDaily'));

    // 1. Inspect sample hotel bookings
    const hotelSamples = await Booking.find({}).limit(3).lean();
    console.log('\n=== SAMPLE HOTEL BOOKINGS ===');
    hotelSamples.forEach((b, i) => {
        console.log(`[${i}] status=${b.status}, pricing=${JSON.stringify(b.pricing)}, createdAt=${b.createdAt}`);
    });

    // 2. Inspect sample event bookings
    const eventSamples = await EventBooking.find({}).limit(3).lean();
    console.log('\n=== SAMPLE EVENT BOOKINGS ===');
    eventSamples.forEach((b, i) => {
        console.log(`[${i}] status=${b.status}, pricing=${JSON.stringify(b.pricing)}, createdAt=${b.createdAt}`);
    });

    // 3. Aggregate revenue from ALL non-cancelled hotel bookings (ignoring date)
    const hotelRevAll = await Booking.aggregate([
        { $match: { status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' }, count: { $sum: 1 } } }
    ]);
    console.log('\n=== HOTEL REVENUE (all non-cancelled) ===');
    console.log(JSON.stringify(hotelRevAll));

    // 4. Aggregate revenue from ALL non-cancelled event bookings
    const eventRevAll = await EventBooking.aggregate([
        { $match: { status: { $ne: 'CANCELLED' } } },
        { $group: { _id: null, total: { $sum: '$pricing.totalAmount' }, count: { $sum: 1 } } }
    ]);
    console.log('\n=== EVENT REVENUE (all non-cancelled) ===');
    console.log(JSON.stringify(eventRevAll));

    // 5. Show AnalyticsDaily state
    const adCount = await AnalyticsDaily.countDocuments();
    const adNonZero = await AnalyticsDaily.find({ totalRevenue: { $gt: 0 } }).limit(3).lean();
    console.log(`\n=== ANALYTICS DAILY: ${adCount} total, ${adNonZero.length} with revenue > 0 ===`);
    console.log(JSON.stringify(adNonZero));

    await mongoose.disconnect();
    console.log('\n✅ Done');
}

run().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
