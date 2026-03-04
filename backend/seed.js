require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const AnalyticsDaily = require('./models/AnalyticsDaily');
const Alert = require('./models/Alert');

const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Penthouse'];
const statuses = ['confirmed', 'cancelled', 'completed'];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB. Clearing old data...');

        await Booking.deleteMany({});
        await Payment.deleteMany({});
        await AnalyticsDaily.deleteMany({});
        await Alert.deleteMany({});

        console.log('Seeding new dummy data...');
        const bookings = [];
        const today = new Date();

        // Generate 50 items
        for (let i = 0; i < 50; i++) {
            // Random past date up to 60 days
            const pastDays = Math.floor(Math.random() * 60);
            const createdAt = new Date(today);
            createdAt.setDate(today.getDate() - pastDays);

            const checkIn = new Date(createdAt);
            checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 5));

            const checkOut = new Date(checkIn);
            checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 5) + 1);

            const amount = Math.floor(Math.random() * 20000) + 5000;

            const booking = new Booking({
                userId: `USER_${Math.floor(Math.random() * 1000)}`,
                roomType: roomTypes[Math.floor(Math.random() * roomTypes.length)],
                checkInDate: checkIn,
                checkOutDate: checkOut,
                totalAmount: amount,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                createdAt: createdAt
            });

            bookings.push(booking);
            await booking.save();

            const payment = new Payment({
                bookingId: booking._id,
                amount: booking.status !== 'cancelled' ? amount : 0,
                paymentStatus: booking.status === 'cancelled' ? 'refunded' : 'paid',
                refundAmount: booking.status === 'cancelled' ? amount : (Math.random() > 0.9 ? amount * 0.5 : 0),
                createdAt: createdAt
            });
            await payment.save();
        }

        // Generate daily analytics for last 30 days
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);

            await AnalyticsDaily.create({
                date: new Date(d.setHours(0, 0, 0, 0)),
                totalRevenue: Math.floor(Math.random() * 100000) + 20000,
                totalBookings: Math.floor(Math.random() * 20) + 5,
                occupancyRate: Math.floor(Math.random() * 40) + 40 // 40-80%
            });
        }

        // Generate some mock alerts
        await Alert.create({
            type: 'Revenue Leak Detected',
            description: 'Refund amount exceeded 50,000 LKR.',
            severity: 'high'
        });

        console.log('Database seeding complete!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedDatabase();
