/**
 * Anomaly Detection Service
 * 
 * Rule-based anomaly detection for Progress 1.
 * Creates Alert records when rules are triggered.
 * Idempotent: checks if similar alert already exists today before creating.
 */

const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const AnalyticsDaily = require('../models/AnalyticsDaily');
const Alert = require('../models/Alert');

/**
 * Run all anomaly detection rules and create alerts as needed.
 * Rules:
 * 1. refundAmount > 50000 => REVENUE_LEAK severity HIGH
 * 2. todayRevenue < (avg30Revenue * 0.6) => REVENUE_DROP severity HIGH
 * 3. cancellationsToday > 5 => HIGH_CANCELLATION severity MEDIUM
 */
async function checkAndCreateAlerts() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const createdAlerts = [];

    // ---- RULE 1: High refund amounts (REVENUE_LEAK) ----
    const highRefunds = await Payment.find({
        refundAmount: { $gt: 50000 },
        createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    if (highRefunds.length > 0) {
        const existing = await Alert.findOne({
            type: 'REVENUE_LEAK',
            status: 'ACTIVE',
            createdAt: { $gte: todayStart }
        });

        if (!existing) {
            const totalRefundAmount = highRefunds.reduce((sum, p) => sum + p.refundAmount, 0);
            const alert = await Alert.create({
                type: 'REVENUE_LEAK',
                description: `Detected ${highRefunds.length} refund(s) exceeding Rs. 50,000 today. Total refund amount: Rs. ${totalRefundAmount.toLocaleString()}.`,
                severity: 'HIGH'
            });
            createdAlerts.push(alert);
        }
    }

    // ---- RULE 2: Revenue drop (REVENUE_DROP) ----
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyStats = await AnalyticsDaily.find({
        date: { $gte: thirtyDaysAgo, $lt: todayStart }
    });

    if (dailyStats.length > 0) {
        const avg30Revenue = dailyStats.reduce((sum, d) => sum + d.totalRevenue, 0) / dailyStats.length;

        // Get today's analytics (may not exist yet)
        const todayAnalytics = await AnalyticsDaily.findOne({
            date: { $gte: todayStart, $lte: todayEnd }
        });

        const todayRevenue = todayAnalytics ? todayAnalytics.totalRevenue : 0;

        if (todayRevenue < avg30Revenue * 0.6) {
            const existing = await Alert.findOne({
                type: 'REVENUE_DROP',
                status: 'ACTIVE',
                createdAt: { $gte: todayStart }
            });

            if (!existing) {
                const alert = await Alert.create({
                    type: 'REVENUE_DROP',
                    description: `Today's revenue (Rs. ${todayRevenue.toLocaleString()}) is below 60% of the 30-day average (Rs. ${Math.round(avg30Revenue).toLocaleString()}).`,
                    severity: 'HIGH'
                });
                createdAlerts.push(alert);
            }
        }
    }

    // ---- RULE 3: High cancellations (HIGH_CANCELLATION) ----
    const cancellationsToday = await Booking.countDocuments({
        status: 'CANCELLED',
        createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    if (cancellationsToday > 5) {
        const existing = await Alert.findOne({
            type: 'HIGH_CANCELLATION',
            status: 'ACTIVE',
            createdAt: { $gte: todayStart }
        });

        if (!existing) {
            const alert = await Alert.create({
                type: 'HIGH_CANCELLATION',
                description: `${cancellationsToday} bookings cancelled today, exceeding the threshold of 5.`,
                severity: 'MEDIUM'
            });
            createdAlerts.push(alert);
        }
    }

    return createdAlerts;
}

module.exports = {
    checkAndCreateAlerts
};
