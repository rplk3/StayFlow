const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/dashboard', analyticsController.getDashboardData);
router.get('/forecast', analyticsController.getForecast);
router.get('/alerts', analyticsController.getAlerts);
router.post('/check-anomalies', analyticsController.checkAnomalies);
router.post('/query', analyticsController.queryAnalytics);

module.exports = router;
