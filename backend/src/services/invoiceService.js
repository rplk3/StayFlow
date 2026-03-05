const PDFDocument = require('pdfkit');

/**
 * Generate PDF Invoice buffer
 * @param {Object} invoice Invoice mongoose document populated with booking details
 * @returns {Promise<Buffer>}
 */
const generateInvoicePDF = (invoice) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // Header
            doc.fontSize(20).text('HOTEL GRAND', { align: 'center' });
            doc.moveDown();
            doc.fontSize(16).text('INVOICE', { align: 'center' });
            doc.moveDown();

            // Invoice Details
            doc.fontSize(10);
            doc.text(`Invoice No: ${invoice.invoiceNo}`);
            doc.text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`);
            doc.text(`Customer ID: ${invoice.userId}`);
            doc.moveDown();

            // Booking Summary
            doc.fontSize(12).text('Booking Summary', { underline: true });
            doc.fontSize(10);
            if (invoice.bookingId) {
                doc.text(`Booking ID: ${invoice.bookingId._id || invoice.bookingId}`);
                if (invoice.bookingId.roomType) doc.text(`Room Type: ${invoice.bookingId.roomType}`);
                if (invoice.bookingId.checkInDate && invoice.bookingId.checkOutDate) {
                    doc.text(`Dates: ${new Date(invoice.bookingId.checkInDate).toLocaleDateString()} to ${new Date(invoice.bookingId.checkOutDate).toLocaleDateString()}`);
                }
            }
            doc.moveDown();

            // Status Stamp
            if (invoice.paymentId && invoice.paymentId.status === 'SUCCESS') {
                doc.fillColor('green').fontSize(16).text('PAID', 450, doc.y - 40, { align: 'right' });
                doc.fillColor('black'); // reset color
            }

            // Line Items Table Header
            let currentY = doc.y + 15;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Description', 50, currentY);
            doc.text('Qty', 300, currentY);
            doc.text('Unit Price', 380, currentY);
            doc.text('Total', 480, currentY);
            doc.moveTo(50, currentY + 15).lineTo(550, currentY + 15).stroke();

            currentY += 25;
            doc.font('Helvetica');

            invoice.lineItems.forEach(item => {
                doc.text(item.description, 50, currentY, { width: 240 });
                doc.text(item.qty.toString(), 300, currentY);
                doc.text(`LKR ${item.unitPrice.toFixed(2)}`, 380, currentY);
                doc.text(`LKR ${item.total.toFixed(2)}`, 480, currentY);
                currentY += 20;

                // check page break
                if (currentY > 700) {
                    doc.addPage();
                    currentY = 50;
                }
            });

            doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
            currentY += 15;

            // Totals
            doc.text(`Subtotal:`, 380, currentY);
            doc.text(`LKR ${invoice.totals.subtotal.toFixed(2)}`, 480, currentY);
            currentY += 20;

            doc.text(`Tax (10%):`, 380, currentY);
            doc.text(`LKR ${invoice.totals.tax.toFixed(2)}`, 480, currentY);
            currentY += 20;

            doc.text(`Service Chg (5%):`, 380, currentY);
            doc.text(`LKR ${invoice.totals.serviceCharge.toFixed(2)}`, 480, currentY);
            currentY += 20;

            if (invoice.totals.discount > 0) {
                doc.text(`Discount:`, 380, currentY);
                doc.text(`- LKR ${invoice.totals.discount.toFixed(2)}`, 480, currentY);
                currentY += 20;
            }

            doc.moveTo(350, currentY).lineTo(550, currentY).stroke();
            currentY += 10;

            doc.font('Helvetica-Bold').fontSize(12);
            doc.text(`Grand Total:`, 350, currentY);
            doc.text(`LKR ${invoice.totals.grandTotal.toFixed(2)}`, 480, currentY);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateInvoicePDF
};
