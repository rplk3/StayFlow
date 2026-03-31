const analyticsService = require('../services/analyticsService');
const forecastingService = require('../services/forecastingService');
const anomalyService = require('../services/anomalyService');
const Alert = require('../models/Alert');
const { GoogleGenAI } = require('@google/genai');

/**
 * POST /api/analytics/rebuild-daily
 * Aggregates and writes AnalyticsDaily for last 60 days
 */
exports.rebuildDaily = async (req, res) => {
    try {
        const results = await analyticsService.rebuildDailyAnalytics(60);
        res.json({
            message: `Successfully rebuilt daily analytics for ${results.length} days.`,
            count: results.length
        });
    } catch (error) {
        console.error('Error rebuilding daily analytics:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/analytics/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns summary + series arrays for charts
 */
exports.getDashboard = async (req, res) => {
    try {
        const { from, to } = req.query;
        const data = await analyticsService.getDashboardData(from, to);
        res.json(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/analytics/forecast?days=7
 * Returns predicted series for next N days (baseline)
 */
exports.getForecast = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const forecast = await forecastingService.getBaselineForecast(days);
        res.json(forecast);
    } catch (error) {
        console.error('Error generating forecast:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * POST /api/analytics/check-anomalies
 * Runs anomaly rules and inserts alerts (idempotent)
 */
exports.checkAnomalies = async (req, res) => {
    try {
        const alerts = await anomalyService.checkAndCreateAlerts();
        res.json({
            message: 'Anomaly check complete.',
            createdAlerts: alerts.length,
            alerts
        });
    } catch (error) {
        console.error('Error checking anomalies:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/analytics/alerts?status=ACTIVE
 * List alerts, optionally filtered by status
 */
exports.getAlerts = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status.toUpperCase();
        }
        const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(50);
        res.json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * PATCH /api/analytics/alerts/:id/resolve
 * Set alert status to RESOLVED
 */
exports.resolveAlert = async (req, res) => {
    try {
        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            { status: 'RESOLVED' },
            { new: true }
        );
        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }
        res.json(alert);
    } catch (error) {
        console.error('Error resolving alert:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * POST /api/analytics/chat
 * GenAI conversational endpoint powered by Gemini API
 */
exports.handleChatQuery = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ answer: "Please provide a message." });
        }

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            return res.json({ answer: "Gemini API key is not configured in the backend. Please set GEMINI_API_KEY in your .env file." });
        }

        // Fetch current live metrics — handle failure gracefully
        let contextData = 'No analytics data available at the moment.';
        try {
            const data = await analyticsService.getDashboardData();
            contextData = `
            Current System Data (Last 30 days):
            Total Revenue: Rs. ${data.totalRevenue || 0}
            Total Bookings: ${data.totalBookings || 0}
            Average Occupancy Rate: ${data.avgOccupancy || 0}%
            Active Alerts Count: ${data.activeAlertsCount || 0}
            `;
        } catch (dataErr) {
            console.warn('Could not fetch dashboard data for chat context:', dataErr.message);
        }

        const systemInstruction = `You are a helpful Admin Assistant for the StayFlow hotel management system.
Your only job is to answer questions related to the system's performance metrics, bookings, revenue, occupancy, and alerts based on the provided "Current System Data". 
If the user asks a question COMPLETELY UNRELATED to the hotel's performance analytics, revenue, or bookings (such as "How to plant a tree", "What is the capital of France", etc.), you MUST refuse to answer and state that you can only answer questions related to performance analytics and bookings. Be concise and natural in your answers.`;

        const ai = new GoogleGenAI({ apiKey: apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: [
                { role: 'user', parts: [{ text: `${contextData}\n\nUser Question: ${message}` }] }
            ],
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2
            }
        });

        const reply = response.text || "I'm sorry, I couldn't generate an answer.";
        res.json({ answer: reply });

    } catch (error) {
        console.error('Error generating chat response:', error.message || error);

        // Check for rate limit (429) errors
        const errMsg = (error.message || '').toLowerCase();
        if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate') || errMsg.includes('resource_exhausted')) {
            return res.status(429).json({
                answer: ' The AI service is temporarily rate-limited. The free tier API quota has been exceeded. Please wait about a minute and try again.',
                retryable: true
            });
        }

        const errorDetail = error.message || 'Unknown error';
        res.status(500).json({ answer: `I'm having trouble connecting to the AI service. Error: ${errorDetail}` });
    }
};

