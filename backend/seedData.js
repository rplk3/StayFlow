const mongoose = require('mongoose');
require('dotenv').config();

const Booking = require('./src/models/Booking');
const Invoice = require('./src/models/Invoice');
const Payment = require('./src/models/Payment');
const Refund = require('./src/models/Refund');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas for seeding.');

        // Clear existing data (optional, but good for a fresh start)
        await Booking.deleteMany({});
        await Invoice.deleteMany({});
        await Payment.deleteMany({});
        await Refund.deleteMany({});

        console.log('Cleared existing data.');

        const users = ['user_123', 'user_456', 'user_789'];
        const roomTypes = ['Deluxe', 'Standard', 'Suite'];

        // 1. Create Bookings
        const b1 = await Booking.create({
            userId: users[0],
            roomType: roomTypes[0],
            checkInDate: new Date('2026-03-10'),
            checkOutDate: new Date('2026-03-15'),
            nights: 5,
            basePricePerNight: 15000,
            extras: [{ name: 'Breakfast', price: 2000 }],
            billing: {
                subtotal: 77000,
                tax: 7700,
                serviceCharge: 3850,
                discount: 0,
                total: 88550,
            },
            bookingStatus: 'CONFIRMED',
            paymentStatus: 'PAID',
        });

        const b2 = await Booking.create({
            userId: users[1],
            roomType: roomTypes[1],
            checkInDate: new Date('2026-03-12'),
            checkOutDate: new Date('2026-03-14'),
            nights: 2,
            basePricePerNight: 10000,
            extras: [],
            billing: {
                subtotal: 20000,
                tax: 2000,
                serviceCharge: 1000,
                discount: 0,
                total: 23000,
            },
            bookingStatus: 'PENDING',
            paymentStatus: 'UNPAID',
        });

        const b3 = await Booking.create({
            userId: users[2],
            roomType: roomTypes[2],
            checkInDate: new Date('2026-03-01'),
            checkOutDate: new Date('2026-03-03'),
            nights: 2,
            basePricePerNight: 30000,
            extras: [{ name: 'Airport Pickup', price: 5000 }],
            billing: {
                subtotal: 65000,
                tax: 6500,
                serviceCharge: 3250,
                discount: 0,
                total: 74750,
            },
            bookingStatus: 'CANCELLED',
            paymentStatus: 'REFUNDED',
        });

        console.log('Created bookings.');

        // 2. Create Payments
        const p1 = await Payment.create({
            bookingId: b1._id,
            userId: b1.userId,
            amount: b1.billing.total,
            currency: 'LKR',
            method: 'CARD',
            gateway: 'STRIPE',
            transactionRef: 'txn_1234567890',
            status: 'SUCCESS',
        });

        const p3 = await Payment.create({
            bookingId: b3._id,
            userId: b3.userId,
            amount: b3.billing.total,
            currency: 'LKR',
            method: 'CARD',
            gateway: 'STRIPE',
            transactionRef: 'txn_0987654321',
            status: 'REFUNDED',
        });

        console.log('Created payments.');

        // 3. Create Invoices
        await Invoice.create({
            invoiceNo: 'INV-2026-001',
            bookingId: b1._id,
            paymentId: p1._id,
            userId: b1.userId,
            issueDate: new Date('2026-03-05'),
            lineItems: [
                { description: 'Deluxe Room - 5 Nights', qty: 5, unitPrice: 15000, total: 75000 },
                { description: 'Breakfast', qty: 1, unitPrice: 2000, total: 2000 },
            ],
            totals: {
                subtotal: 77000,
                tax: 7700,
                serviceCharge: 3850,
                discount: 0,
                grandTotal: 88550,
            },
        });

        console.log('Created invoices.');

        // 4. Create Refunds
        await Refund.create({
            paymentId: p3._id,
            bookingId: b3._id,
            amount: b3.billing.total,
            reason: 'Customer requested cancellation',
            status: 'PROCESSED',
        });

        console.log('Created refunds.');

        console.log('Database seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedData();
