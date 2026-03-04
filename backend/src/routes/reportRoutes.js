const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Generate report data (JSON preview)
router.post('/generate', reportController.generateReport);

// Download PDF report
router.get('/pdf', reportController.downloadPDF);

module.exports = router;
