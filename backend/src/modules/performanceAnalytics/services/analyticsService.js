/**
 * Analytics Service
 * Handles daily aggregation of bookings + payments into AnalyticsDaily,
 * and provides dashboard data queries.
 */

const Booking = require('../../hotelRoom/models/Booking');
const EventBooking = require('../../eventHall/models/EventBooking');
const Payment = require('../../payment/models/Payment');
const Room = require('../../hotelRoom/models/Room');
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
        const dayStart = new Date(today);
        dayStart.setDate(today.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        // Count hotel bookings
        const hTotal = await Booking.countDocuments({
            createdAt: { $gte: dayStart, $lte: dayEnd }
        });
        const hActive = await Booking.countDocuments({
            createdAt: { $gte: dayStart, $lte: dayEnd },
            status: { $nin: ['CANCELLED', 'NO_SHOW'] }
        });
        const hCancelled = await Booking.countDocuments({
            createdAt: { $gte: dayStart, $lte: dayEnd },
            status: 'CANCELLED'
        });

        // Count event hall bookings
        const eTotal = await EventBooking.countDocuments({
            createdAt: { $gte: dayStart, $lte: dayEnd }
        });
        const eActive = await EventBooking.countDocuments({
            createdAt: { $gte: dayStart, $lte: dayEnd },
            status: { $nin: ['CANCELLED', 'REJECTED'] }
        });
        const eCancelled = await EventBooking.countDocuments({
            createdAt: { $gte: dayStart, $lte: dayEnd },
            status: 'CANCELLED'
        });

        const totalBookings = hTotal + eTotal;
        const activeBookings = hActive + eActive;
        const cancelledBookings = hCancelled + eCancelled;

        // Revenue from hotel bookings (pricing.totalAmount)
        const hotelRev = await Booking.aggregate([
            { $match: { createdAt: { $gte: dayStart, $lte: dayEnd }, status: { $ne: 'CANCELLED' } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
        ]);
        
        // Revenue from event hall bookings (pricing.totalAmount)
        const eventRev = await EventBooking.aggregate([
            { $match: { createdAt: { $gte: dayStart, $lte: dayEnd }, status: { $ne: 'CANCELLED' } } },
            { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
        ]);

        let totalRevenue = 0;
        if (hotelRev.length > 0) totalRevenue += hotelRev[0].total;
        if (eventRev.length > 0) totalRevenue += eventRev[0].total;

        // Debug: log first day with data
        if (totalBookings > 0 && i < 3) {
            console.log(`[Analytics Debug] ${dayStart.toISOString().split('T')[0]} | bookings=${totalBookings} | activeBookings=${activeBookings} | totalRooms=${totalRoomsAllTypes} | occupancy=${((activeBookings / totalRoomsAllTypes) * 100).toFixed(2)}% | hotelRev=${JSON.stringify(hotelRev)} | eventRev=${JSON.stringify(eventRev)} | totalRevenue=${totalRevenue}`);
        }

        // Occupancy = (active bookings that day / total rooms) * 100
        const occupancyRate = Math.min(
            (activeBookings / totalRoomsAllTypes) * 100,
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
