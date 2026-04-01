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
