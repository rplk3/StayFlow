const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// Daily aggregation
router.post('/rebuild-daily', analyticsController.rebuildDaily);

// Dashboard data
router.get('/dashboard', analyticsController.getDashboard);

// Forecasting
router.get('/forecast', analyticsController.getForecast);

// Anomaly detection
router.post('/check-anomalies', analyticsController.checkAnomalies);

// Alerts
router.get('/alerts', analyticsController.getAlerts);
router.patch('/alerts/:id/resolve', analyticsController.resolveAlert);

// Conversational BI Chatbot
router.post('/chat', analyticsController.handleChatQuery);

module.exports = router;
