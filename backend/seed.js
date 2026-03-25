require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const AnalyticsDaily = require('./models/AnalyticsDaily');
const Alert = require('./models/Alert');
const Hotel = require('./models/Hotel');
const User = require('./src/modules/auth/models/User'); // Added User import

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
        await Hotel.deleteMany({});

        console.log('Seeding new dummy data...');
        const locations = ['Colombo', 'Kandy', 'Galle', 'Nuwara Eliya', 'Ella', 'Kurunegala'];
        
        console.log('Seeding admin user...');
        const adminEmail = 'adminportal@gmail.com';
        await User.deleteMany({ email: adminEmail });
        await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: adminEmail,
            password: 'Admin@123',
            role: 'admin',
            adminStatus: 'approved'
        });

        console.log('Seeding hotels and locations...');
        for (const loc of locations) {
            for (let j = 1; j <= 5; j++) {
                const hotelName = `${loc} Grand Hotel ${j}`;
                const hotel = new Hotel({
                    name: hotelName,
                    destination: loc,
                    starRating: Math.floor(Math.random() * 3) + 3, // 3 to 5 stars
                    images: [`https://loremflickr.com/400/250/hotel,${loc.replace(' ', '')}`],
                    amenities: ['Free WiFi', 'Pool', 'Breakfast Included', 'Spa'].slice(0, Math.floor(Math.random() * 4) + 1),
                    pricePerNight: Math.floor(Math.random() * 15000) + 5000,
                    description: `A wonderful property located in the heart of ${loc}.`
                });
                await hotel.save();
            }
        }
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
