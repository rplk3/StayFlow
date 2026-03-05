require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const Invoice = require('./models/Invoice');
const Refund = require('./models/Refund');
const { calculateBilling } = require('./services/billingService');
const connectDB = require('./config/db');

const seedBookings = async () => {
    try {
        await connectDB();

        // Clear existing collections to start fresh
        await Booking.deleteMany({});
        await Payment.deleteMany({});
        await Invoice.deleteMany({});
        await Refund.deleteMany({});
        console.log('Collections cleared');

        const sampleUsers = ['user_001', 'user_002', 'user_003'];
        const roomTypes = ['Deluxe', 'Suite', 'Standard', 'Penthouse'];

        const bookingsData = [];

        for (let i = 0; i < 10; i++) {
            const checkIn = new Date();
            checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 30));

            const checkOut = new Date(checkIn);
            checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 5) + 1);

            const basePricePerNight = Math.floor(Math.random() * 10000) + 5000;

            const extras = [];
            if (Math.random() > 0.5) {
                extras.push({ name: 'Breakfast', price: 1500 });
            }
            if (Math.random() > 0.8) {
                extras.push({ name: 'Airport Transfer', price: 3000 });
            }

            const billing = calculateBilling(checkIn, checkOut, basePricePerNight, extras, 0);

            bookingsData.push({
                userId: sampleUsers[i % 3],
                roomType: roomTypes[i % 4],
                checkInDate: checkIn,
                checkOutDate: checkOut,
                nights: billing.nights,
                basePricePerNight,
                extras,
                billing,
                bookingStatus: 'PENDING',
                paymentStatus: 'UNPAID'
            });
        }

        await Booking.insertMany(bookingsData);
        console.log('10 Sample Bookings seeded successfully.');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedBookings();
