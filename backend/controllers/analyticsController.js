const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const AnalyticsDaily = require('../models/AnalyticsDaily');
const Alert = require('../models/Alert');

exports.getDashboardData = async (req, res) => {
    try {
        const today = new Date();
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const matchCurrentMonth = { createdAt: { $gte: currentMonthStart } };

        // Total Revenue this month
        const totalPayments = await Payment.aggregate([
            { $match: matchCurrentMonth },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = totalPayments.length > 0 ? totalPayments[0].total : 0;

        // Total Bookings this month
        const totalBookings = await Booking.countDocuments(matchCurrentMonth);

        // Occupancy (Simple formula placeholder assuming 100 rooms)
        const activeBookings = await Booking.countDocuments({
            status: 'confirmed',
            checkInDate: { $lte: today },
            checkOutDate: { $gte: today }
        });
        const occupancyRate = (activeBookings / 100) * 100; // Formula provided

        // Trend last 30 days
        const dailyStats = await AnalyticsDaily.find({ date: { $gte: thirtyDaysAgo } }).sort({ date: 1 });
        const revenueLast30Days = dailyStats.map(stat => ({ date: stat.date, revenue: stat.totalRevenue }));
        const occupancyLast30Days = dailyStats.map(stat => ({ date: stat.date, occupancy: stat.occupancyRate }));

        res.json({
            totalRevenue,
            totalBookings,
            occupancyRate,
            revenueLast30Days,
            occupancyLast30Days
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getForecast = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyStats = await AnalyticsDaily.find({ date: { $gte: thirtyDaysAgo } });

        // Basic average formula
        const avgRevenue = dailyStats.reduce((sum, s) => sum + s.totalRevenue, 0) / (dailyStats.length || 1);
        const avgOccupancy = dailyStats.reduce((sum, s) => sum + s.occupancyRate, 0) / (dailyStats.length || 1);

        const forecast = [];
        const today = new Date();
        for (let i = 1; i <= 7; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);
            forecast.push({
                date: nextDate,
                predictedRevenue: avgRevenue,
                predictedOccupancy: avgOccupancy
            });
        }

        res.json(forecast);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ createdAt: -1 }).limit(20);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.checkAnomalies = async (req, res) => {
    try {
        let createdAlerts = [];

        // Rule 1: High refund amount (> 50,000)
        const recentHighRefunds = await Payment.find({
            refundAmount: { $gt: 50000 },
            createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) }
        });

        if (recentHighRefunds.length > 0) {
            await Alert.create({
                type: 'Revenue Leak Detected',
                description: `Found ${recentHighRefunds.length} high refund operations exceeding 50,000 LKR in the last 24h.`,
                severity: 'high'
            });
            createdAlerts.push('Revenue Leak Detected');
        }

        // Rule 2: > 5 cancellations in one day
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        const cancellations = await Booking.countDocuments({ status: 'cancelled', createdAt: { $gte: oneDayAgo } });

        if (cancellations > 5) {
            await Alert.create({
                type: 'Excessive Cancellations',
                description: `Over 5 cancellations detected exactly today.`,
                severity: 'critical'
            });
            createdAlerts.push('Excessive Cancellations');
        }

        // Rule 3: Revenue Drop Drop Detected (skipped for now for simplicity of this endpoint)

        res.json({ message: 'Anomaly check complete', createdAlerts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.queryAnalytics = async (req, res) => {
    try {
        const { question } = req.body;
        const lowerQ = question.toLowerCase();

        if (lowerQ.includes('total revenue')) {
            const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const totalPayments = await Payment.aggregate([
                { $match: { createdAt: { $gte: currentMonthStart } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            const totalRevenue = totalPayments.length > 0 ? totalPayments[0].total : 0;
            return res.json({ answer: `The total revenue this month is ${totalRevenue.toLocaleString()} LKR.` });
        }

        if (lowerQ.includes('most profitable room')) {
            const roomProfits = await Booking.aggregate([
                { $group: { _id: '$roomType', revenue: { $sum: '$totalAmount' } } },
                { $sort: { revenue: -1 } },
                { $limit: 1 }
            ]);
            if (roomProfits.length > 0) {
                return res.json({ answer: `The most profitable room type is ${roomProfits[0]._id} with ${roomProfits[0].revenue.toLocaleString()} LKR.` });
            }
        }

        if (lowerQ.includes('last 7 days')) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const count = await Booking.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
            return res.json({ answer: `There have been ${count} bookings in the last 7 days.` });
        }

        res.json({ answer: "I'm sorry, I don't understand that question yet. Try asking about 'total revenue' or 'most profitable room'." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
