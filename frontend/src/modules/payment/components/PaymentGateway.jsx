import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle, XCircle, Loader2, AlertCircle, ShieldCheck, Calendar, Hash, Download, Mail, UserPlus } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';

const API = 'http://localhost:5000/api/payments';

/* ───────── Color palette (matching LandingPage) ───────── */
const C = {
    900: '#012A4A', 800: '#013A63', 700: '#01497C', 600: '#014F86',
    500: '#2A6F97', 400: '#2C7DA0', 300: '#468FAF', 200: '#61A5C2',
    100: '#89C2D9', 50: '#A9D6E5',
};

const PaymentGateway = ({ bookingId, bookingType, userId, amount, taxAmount, serviceCharge, totalAmount, onSuccess, onFailure, guestDetails, bookingCode, checkIn, checkOut }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);

     // ── Generate Invoice PDF ──
    const generateInvoicePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

    // Header bar
        doc.setFillColor(1, 42, 74); // C[900]
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setFillColor(1, 73, 124); // C[700]
        doc.rect(0, 40, pageWidth, 4, 'F');

        // Logo/Brand
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('StayFlow', 20, 25);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Booking Invoice', 20, 33);

        // Invoice details top right
        doc.setFontSize(9);
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - 20, 20, { align: 'right' });
        if (result?.invoice?.invoiceNumber) {
            doc.text(`Invoice #: ${result.invoice.invoiceNumber}`, pageWidth - 20, 27, { align: 'right' });
        }
        if (result?.payment?.transactionReference) {
            doc.text(`Ref: ${result.payment.transactionReference}`, pageWidth - 20, 34, { align: 'right' });
        }

        let y = 58;


