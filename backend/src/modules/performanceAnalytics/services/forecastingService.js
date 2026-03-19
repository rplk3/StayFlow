/**
 * Forecasting Service
 * 
 * PROGRESS 1: Baseline forecasting using moving average.
 * NO ML model training — uses simple average of last 30 days AnalyticsDaily.
 * 
 * PROGRESS 2/FINAL: This service is designed to be swapped with a trained
 * regression/ML model. Replace getBaselineForecast() with a model-inference
 * function that loads a trained model and generates predictions.
 */

const AnalyticsDaily = require('../models/AnalyticsDaily');

/**
 * Get baseline forecast for the next N days.
 * Uses average of last 30 days as the prediction.
 * 
 * @param {number} days - Number of days to forecast (default 7)
 * @returns {Array} Predicted series: [{date, predictedRevenue, predictedOccupancy}]
 */
async function getBaselineForecast(days = 7) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const dailyStats = await AnalyticsDaily.find({
        date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    if (dailyStats.length === 0) {
        // No historical data — return flat zero predictions
        return generateFlatForecast(days, 0, 0);
    }

    // Calculate moving averages
    const avgRevenue = dailyStats.reduce((sum, s) => sum + s.totalRevenue, 0) / dailyStats.length;
    const avgOccupancy = dailyStats.reduce((sum, s) => sum + s.occupancyRate, 0) / dailyStats.length;
    const avgBookings = dailyStats.reduce((sum, s) => sum + s.totalBookings, 0) / dailyStats.length;

    // Add slight day-over-day variation for more realistic charting
    // This simulates a basic trend without ML
    const forecast = [];
    const today = new Date();

    for (let i = 1; i <= days; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);

        // Small random variation ±10% for visual realism
        const revVariation = 1 + (Math.random() * 0.2 - 0.1);
        const occVariation = 1 + (Math.random() * 0.1 - 0.05);

        forecast.push({
            date: nextDate.toISOString().split('T')[0],
            predictedRevenue: Math.round(avgRevenue * revVariation),
            predictedOccupancy: Math.round(avgOccupancy * occVariation * 100) / 100,
            predictedBookings: Math.round(avgBookings * revVariation)
        });
    }

    return forecast;
}

function generateFlatForecast(days, revenue, occupancy) {
    const forecast = [];
    const today = new Date();
    for (let i = 1; i <= days; i++) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + i);
        forecast.push({
            date: nextDate.toISOString().split('T')[0],
            predictedRevenue: revenue,
            predictedOccupancy: occupancy,
            predictedBookings: 0
        });
    }
    return forecast;
}

/**
 * PLACEHOLDER for ML-based forecasting (Progress 2/Final)
 * 
 * async function getMLForecast(days) {
 *   // 1. Load trained model from file/cloud
 *   // 2. Prepare feature vectors from AnalyticsDaily
 *   // 3. Run inference
 *   // 4. Return predictions in same format as getBaselineForecast
 * }
 */

module.exports = {
    getBaselineForecast
};
