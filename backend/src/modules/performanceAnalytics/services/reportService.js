/**
 * Report Service
 * Generates report data (JSON) and PDF documents using pdfkit.
 * 
 * Report types: revenue, occupancy, bookings, alerts
 */

const AnalyticsDaily = require('../models/AnalyticsDaily');
const Alert = require('../models/Alert');
const PDFDocument = require('pdfkit');

/**
 * Generate report data in JSON format.
 * Returns summary cards + table rows + chart series.
 * 
 * @param {string} type - Report type: revenue | occupancy | bookings | alerts
 * @param {string} from - Start date YYYY-MM-DD
 * @param {string} to - End date YYYY-MM-DD
 */
async function generateReportData(type, from, to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);

    if (type === 'alerts') {
        return generateAlertsReport(fromDate, toDate);
    }

    // Get analytics daily records
    const records = await AnalyticsDaily.find({
        date: { $gte: fromDate, $lte: toDate }
    }).sort({ date: 1 });

    if (records.length === 0) {
        return { summary: {}, tableRows: [], chartSeries: [], message: 'No data found for the selected range.' };
    }

    switch (type) {
        case 'revenue':
            return generateRevenueReport(records);
        case 'occupancy':
            return generateOccupancyReport(records);
        case 'bookings':
            return generateBookingsReport(records);
        default:
            return generateRevenueReport(records);
    }
}

function generateRevenueReport(records) {
    const totalRevenue = records.reduce((sum, r) => sum + r.totalRevenue, 0);
    const avgDailyRevenue = totalRevenue / records.length;
    const maxRevenueDay = records.reduce((max, r) => r.totalRevenue > max.totalRevenue ? r : max, records[0]);
    const minRevenueDay = records.reduce((min, r) => r.totalRevenue < min.totalRevenue ? r : min, records[0]);

    return {
        summary: {
            totalRevenue: Math.round(totalRevenue),
            avgDailyRevenue: Math.round(avgDailyRevenue),
            peakRevenueDay: maxRevenueDay.date.toISOString().split('T')[0],
            peakRevenueAmount: Math.round(maxRevenueDay.totalRevenue),
            lowestRevenueDay: minRevenueDay.date.toISOString().split('T')[0],
            lowestRevenueAmount: Math.round(minRevenueDay.totalRevenue),
            totalDays: records.length
        },
        tableRows: records.map(r => ({
            date: r.date.toISOString().split('T')[0],
            revenue: Math.round(r.totalRevenue),
            bookings: r.totalBookings,
            occupancy: r.occupancyRate
        })),
        chartSeries: records.map(r => ({
            date: r.date.toISOString().split('T')[0],
            value: Math.round(r.totalRevenue)
        }))
    };
}

function generateOccupancyReport(records) {
    const avgOccupancy = records.reduce((sum, r) => sum + r.occupancyRate, 0) / records.length;
    const maxOccDay = records.reduce((max, r) => r.occupancyRate > max.occupancyRate ? r : max, records[0]);
    const minOccDay = records.reduce((min, r) => r.occupancyRate < min.occupancyRate ? r : min, records[0]);

    return {
        summary: {
            avgOccupancy: Math.round(avgOccupancy * 100) / 100,
            peakOccupancyDay: maxOccDay.date.toISOString().split('T')[0],
            peakOccupancy: maxOccDay.occupancyRate,
            lowestOccupancyDay: minOccDay.date.toISOString().split('T')[0],
            lowestOccupancy: minOccDay.occupancyRate,
            totalDays: records.length
        },
        tableRows: records.map(r => ({
            date: r.date.toISOString().split('T')[0],
            occupancy: r.occupancyRate,
            bookings: r.totalBookings,
            revenue: Math.round(r.totalRevenue)
        })),
        chartSeries: records.map(r => ({
            date: r.date.toISOString().split('T')[0],
            value: r.occupancyRate
        }))
    };
}

function generateBookingsReport(records) {
    const totalBookings = records.reduce((sum, r) => sum + r.totalBookings, 0);
    const totalCancelled = records.reduce((sum, r) => sum + r.cancelledBookings, 0);
    const avgDailyBookings = totalBookings / records.length;

    return {
        summary: {
            totalBookings,
            totalCancelled,
            cancellationRate: totalBookings > 0 ? Math.round((totalCancelled / totalBookings) * 100 * 100) / 100 : 0,
            avgDailyBookings: Math.round(avgDailyBookings * 100) / 100,
            totalDays: records.length
        },
        tableRows: records.map(r => ({
            date: r.date.toISOString().split('T')[0],
            bookings: r.totalBookings,
            cancelled: r.cancelledBookings,
            revenue: Math.round(r.totalRevenue),
            occupancy: r.occupancyRate
        })),
        chartSeries: records.map(r => ({
            date: r.date.toISOString().split('T')[0],
            value: r.totalBookings
        }))
    };
}

async function generateAlertsReport(fromDate, toDate) {
    const alerts = await Alert.find({
        createdAt: { $gte: fromDate, $lte: toDate }
    }).sort({ createdAt: -1 });

    const highCount = alerts.filter(a => a.severity === 'HIGH').length;
    const mediumCount = alerts.filter(a => a.severity === 'MEDIUM').length;
    const resolvedCount = alerts.filter(a => a.status === 'RESOLVED').length;

    return {
        summary: {
            totalAlerts: alerts.length,
            highSeverity: highCount,
            mediumSeverity: mediumCount,
            resolved: resolvedCount,
            active: alerts.length - resolvedCount
        },
        tableRows: alerts.map(a => ({
            date: a.createdAt.toISOString().split('T')[0],
            type: a.type,
            description: a.description,
            severity: a.severity,
            status: a.status
        })),
        chartSeries: []
    };
}

/**
 * Generate a PDF report using pdfkit.
 * Returns a Buffer containing the PDF.
 */
async function generatePDF(type, from, to) {
    const reportData = await generateReportData(type, from, to);

    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
            const chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // ---- Header ----
            doc.rect(0, 0, 595, 80).fill('#1E3A8A');
            doc.fillColor('#FFFFFF')
                .fontSize(24)
                .font('Helvetica-Bold')
                .text('Hotel Performance Report', 50, 25);
            doc.fontSize(12)
                .font('Helvetica')
                .text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, 50, 55);

            doc.moveDown(3);

            // ---- Metadata ----
            doc.fillColor('#111827')
                .fontSize(11)
                .font('Helvetica');
            doc.text(`Report Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`, 50, 100);
            doc.text(`Date Range: ${from} to ${to}`, 50, 118);
            doc.text(`Generated: ${new Date().toISOString().split('T')[0]}`, 50, 136);

            doc.moveDown(2);

            // ---- Summary Cards ----
            const summaryY = 170;
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#1E3A8A')
                .text('Summary', 50, summaryY);

            doc.fontSize(10).font('Helvetica').fillColor('#111827');
            let sy = summaryY + 25;
            const summary = reportData.summary || {};
            Object.entries(summary).forEach(([key, value]) => {
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                doc.text(`${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`, 60, sy);
                sy += 18;
            });

            doc.moveDown(2);

            // ---- Data Table ----
            const rows = reportData.tableRows || [];
            if (rows.length > 0) {
                const tableTop = sy + 20;
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#1E3A8A')
                    .text('Detailed Data', 50, tableTop);

                const headers = Object.keys(rows[0]);
                const colWidth = Math.min(Math.floor(480 / headers.length), 120);
                let y = tableTop + 25;

                // Table header
                doc.rect(50, y - 5, headers.length * colWidth, 22).fill('#3B82F6');
                doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
                headers.forEach((h, i) => {
                    doc.text(
                        h.charAt(0).toUpperCase() + h.slice(1),
                        55 + i * colWidth,
                        y,
                        { width: colWidth - 10, align: 'left' }
                    );
                });

                y += 22;

                // Table rows (limit to 30 rows in PDF)
                const displayRows = rows.slice(0, 30);
                doc.fontSize(8).font('Helvetica');

                displayRows.forEach((row, rowIdx) => {
                    // New page if needed
                    if (y > 740) {
                        doc.addPage();
                        y = 50;
                    }

                    // Alternating row colors
                    if (rowIdx % 2 === 0) {
                        doc.rect(50, y - 3, headers.length * colWidth, 18).fill('#F9FAFB');
                    }

                    doc.fillColor('#111827');
                    headers.forEach((h, i) => {
                        const val = row[h] !== undefined ? String(row[h]) : '';
                        doc.text(val, 55 + i * colWidth, y, { width: colWidth - 10, align: 'left' });
                    });

                    y += 18;
                });

                if (rows.length > 30) {
                    doc.moveDown(1);
                    doc.fontSize(9).fillColor('#6B7280')
                        .text(`... and ${rows.length - 30} more rows`, 50);
                }
            }

            // ---- Footer ----
            const pageCount = doc.bufferedPageRange();
            for (let i = 0; i < pageCount.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('#9CA3AF')
                    .text(
                        `Page ${i + 1} of ${pageCount.count} | Hotel Analytics System`,
                        50,
                        doc.page.height - 40,
                        { align: 'center', width: doc.page.width - 100 }
                    );
            }

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    generateReportData,
    generatePDF
};
