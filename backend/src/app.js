const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const analyticsRoutes = require('./modules/performanceAnalytics/routes/analyticsRoutes');
const reportRoutes = require('./modules/performanceAnalytics/routes/reportRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;
