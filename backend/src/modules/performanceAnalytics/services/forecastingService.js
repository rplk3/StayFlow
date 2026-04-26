/**
 * Forecasting Service
 * 

 *average of last 30 days AnalyticsDaily.




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


module.exports = {
    getBaselineForecast
};
