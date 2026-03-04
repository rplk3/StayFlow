/**
 * Analytics Service
 * Handles daily aggregation of bookings + payments into AnalyticsDaily,
 * and provides dashboard data queries.
 */

const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Room = require('../models/Room');
const AnalyticsDaily = require('../models/AnalyticsDaily');
const Alert = require('../models/Alert');

/**
 * Rebuild daily analytics for the last N days.
 * Aggregates bookings + payments per day and upserts into AnalyticsDaily.
 * 
 * Occupancy Rate (per day) = (confirmedBookingsCountThatDay / totalRoomsAllTypes) * 100
 * Revenue per day = sum(Payment.amount) - sum(refundAmount) for that day.
 */
async function rebuildDailyAnalytics(daysBack = 60) {
    // Get total rooms across all types
    const rooms = await Room.find();
    const totalRoomsAllTypes = rooms.reduce((sum, r) => sum + r.totalRooms, 0) || 1;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const results = [];

    for (let i = 0; i < daysBack; i++) {
        const dayStart = new Date();
        dayStart.setDate(today.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        // Count bookings created on this day
        const totalBookings = await Booking.countDocuments({
            createdAt: { $gte: dayStart, $lte: dayEnd }
        });

        const confirmedBookings = await Booking.countDocuments({
            createdAt: { $gte: dayStart, $lte: dayEnd },
            status: 'CONFIRMED'
        });

        const cancelledBookings = await Booking.countDocuments({
            createdAt: { $gte: dayStart, $lte: dayEnd },
            status: 'CANCELLED'
        });

        // Revenue = sum(payments.amount) - sum(payments.refundAmount) for that day
        const paymentAgg = await Payment.aggregate([
            { $match: { createdAt: { $gte: dayStart, $lte: dayEnd } } },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    totalRefunds: { $sum: '$refundAmount' }
                }
            }
        ]);

        const totalRevenue = paymentAgg.length > 0
            ? paymentAgg[0].totalAmount - paymentAgg[0].totalRefunds
            : 0;

        // Occupancy = (confirmed bookings that day / total rooms) * 100
        const occupancyRate = Math.min(
            (confirmedBookings / totalRoomsAllTypes) * 100,
            100
        );

        // Upsert the daily record
        const record = await AnalyticsDaily.findOneAndUpdate(
            { date: dayStart },
            {
                date: dayStart,
                totalRevenue: Math.max(totalRevenue, 0),
                totalBookings,
                cancelledBookings,
                occupancyRate: Math.round(occupancyRate * 100) / 100
            },
            { upsert: true, returnDocument: 'after' }
        );

        results.push(record);
    }

    return results;
}

/**
 * Get dashboard data for a date range.
 * Returns summary cards + time series for charts.
 */
async function getDashboardData(from, to) {
    const fromDate = from ? new Date(from) : (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d; })();
    const toDate = to ? new Date(to) : new Date();
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    // Get AnalyticsDaily records for the range
    const dailyRecords = await AnalyticsDaily.find({
        date: { $gte: fromDate, $lte: toDate }
    }).sort({ date: 1 });

    // Summary calculations
    const totalRevenue = dailyRecords.reduce((sum, d) => sum + d.totalRevenue, 0);
    const totalBookings = dailyRecords.reduce((sum, d) => sum + d.totalBookings, 0);
    const avgOccupancy = dailyRecords.length > 0
        ? dailyRecords.reduce((sum, d) => sum + d.occupancyRate, 0) / dailyRecords.length
        : 0;

    // Active alerts count
    const activeAlertsCount = await Alert.countDocuments({ status: 'ACTIVE' });

    // Series arrays for charts
    const revenueSeries = dailyRecords.map(d => ({
        date: d.date.toISOString().split('T')[0],
        revenue: d.totalRevenue
    }));

    const occupancySeries = dailyRecords.map(d => ({
        date: d.date.toISOString().split('T')[0],
        occupancy: d.occupancyRate
    }));

    return {
        totalRevenue: Math.round(totalRevenue),
        totalBookings,
        avgOccupancy: Math.round(avgOccupancy * 100) / 100,
        activeAlertsCount,
        revenueSeries,
        occupancySeries
    };
}

module.exports = {
    rebuildDailyAnalytics,
    getDashboardData
};
