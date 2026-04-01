const reportService = require('../services/reportService');

/**
 * POST /api/reports/generate
 * body: { type: "revenue"|"occupancy"|"bookings"|"alerts", from, to }
 * Returns JSON: summary cards + table rows + chart series
 */
exports.generateReport = async (req, res) => {
    try {
        const { type, from, to } = req.body;

        if (!type || !from || !to) {
            return res.status(400).json({
                error: 'Missing required fields: type, from, to'
            });
        }

        const validTypes = ['revenue', 'occupancy', 'bookings', 'alerts'];
        if (!validTypes.includes(type.toLowerCase())) {
            return res.status(400).json({
                error: `Invalid report type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        const data = await reportService.generateReportData(type.toLowerCase(), from, to);
        res.json(data);
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/reports/pdf?type=&from=&to=
 * Returns downloadable PDF
 */
exports.downloadPDF = async (req, res) => {
    try {
        const { type, from, to } = req.query;

        if (!type || !from || !to) {
            return res.status(400).json({
                error: 'Missing required query params: type, from, to'
            });
        }

        const pdfBuffer = await reportService.generatePDF(type.toLowerCase(), from, to);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Hotel_${type}_Report_${from}_to_${to}.pdf`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: error.message });
    }
};
