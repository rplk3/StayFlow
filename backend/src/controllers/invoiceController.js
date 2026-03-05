const Invoice = require('../models/Invoice');
const { generateInvoicePDF } = require('../services/invoiceService');

const getInvoicesByBooking = async (req, res) => {
    try {
        const invoices = await Invoice.find({ bookingId: req.params.bookingId }).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
};

const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.invoiceId).populate('bookingId paymentId');
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoice' });
    }
};

const downloadInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.invoiceId).populate('bookingId paymentId');
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        const pdfBuffer = await generateInvoicePDF(invoice);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNo}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Error generating invoice PDF' });
    }
};

module.exports = {
    getInvoicesByBooking,
    getInvoiceById,
    downloadInvoicePDF
};
