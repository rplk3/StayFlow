/**
 * Seed Script — Performance Analytics Module
 * 
 * Generates realistic hotel booking data:
 * - 3 room types (Standard=20, Deluxe=10, Suite=5)
 * - 150+ bookings across 60 days with realistic daily patterns
 * - Payments for confirmed bookings (some with partial refunds)
 * - Automatically runs daily aggregation after seeding
 * 
 * Usage: node src/seed/seed.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Google DNS for SRV resolution
const mongoose = require('mongoose');
const Booking = require('../modules/hotelRoom/models/Booking');
const Payment = require('../modules/payment/models/Payment');
const Room = require('../modules/hotelRoom/models/Room');
const AnalyticsDaily = require('../modules/performanceAnalytics/models/AnalyticsDaily');
const Alert = require('../modules/performanceAnalytics/models/Alert');
const analyticsService = require('../modules/performanceAnalytics/services/analyticsService');

// Room type definitions
const ROOM_TYPES = [
    { roomType: 'Standard', totalRooms: 20, basePrice: 8000 },
    { roomType: 'Deluxe', totalRooms: 10, basePrice: 15000 },
    { roomType: 'Suite', totalRooms: 5, basePrice: 30000 }
];

const BOOKING_STATUSES = ['CONFIRMED', 'CONFIRMED', 'CONFIRMED', 'CANCELLED', 'PENDING'];
// Weighted: ~60% confirmed, 20% cancelled, 20% pending

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB. Starting seed...');

        // Clear existing data
        console.log('Clearing existing data...');
        await Promise.all([
            Booking.deleteMany({}),
            Payment.deleteMany({}),
            Room.deleteMany({}),
            AnalyticsDaily.deleteMany({}),
            Alert.deleteMany({})
        ]);

        // 1. Create room types
        console.log('Creating room types...');
        await Room.insertMany(ROOM_TYPES);
        console.log(`  Created ${ROOM_TYPES.length} room types`);

        // 2. Generate bookings across 60 days
        console.log('Generating bookings and payments...');
        const today = new Date();
        const bookings = [];
        const payments = [];

        // Target: ~3 bookings per day on weekdays, ~4-5 on weekends = ~3.5 avg * 60 = 210 bookings
        for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
            const day = new Date(today);
            day.setDate(today.getDate() - dayOffset);
            day.setHours(0, 0, 0, 0);

            const dayOfWeek = day.getDay();
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

            // More bookings on weekends, fewer on weekdays
            const bookingsForDay = isWeekend ? randomInt(3, 6) : randomInt(2, 4);

            for (let j = 0; j < bookingsForDay; j++) {
                const roomDef = randomElement(ROOM_TYPES);
                const nights = randomInt(1, 5);
                const status = randomElement(BOOKING_STATUSES);

                // Price varies by room type + slight daily variation
                const priceMultiplier = isWeekend ? 1.2 : 1.0;
                const totalAmount = Math.round(roomDef.basePrice * nights * priceMultiplier * (0.9 + Math.random() * 0.2));

                const checkIn = new Date(day);
                checkIn.setHours(14, 0, 0, 0); // 2 PM check-in

                const checkOut = new Date(checkIn);
                checkOut.setDate(checkIn.getDate() + nights);
                checkOut.setHours(11, 0, 0, 0); // 11 AM checkout

                const createdAt = new Date(day);
                createdAt.setHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59));

                const booking = {
                    userId: `USER_${randomInt(100, 999)}`,
                    roomId: `${roomDef.roomType.toUpperCase()}_${randomInt(1, roomDef.totalRooms)}`,
                    roomType: roomDef.roomType,
                    checkInDate: checkIn,
                    checkOutDate: checkOut,
                    nights,
                    totalAmount,
                    status,
                    createdAt
                };

                bookings.push(booking);
            }
        }

        // Insert bookings
        const insertedBookings = await Booking.insertMany(bookings);
        console.log(`  Created ${insertedBookings.length} bookings`);

        // 3. Generate payments for each booking
        for (const booking of insertedBookings) {
            let paymentStatus, paymentAmount, refundAmount;

            if (booking.status === 'CONFIRMED') {
                paymentStatus = 'SUCCESS';
                paymentAmount = booking.totalAmount;
                // 10% chance of partial refund for confirmed bookings
                if (Math.random() < 0.10) {
                    paymentStatus = 'PARTIALLY_REFUNDED';
                    refundAmount = Math.round(paymentAmount * (0.2 + Math.random() * 0.3)); // 20-50% refund
                } else {
                    refundAmount = 0;
                }
            } else if (booking.status === 'CANCELLED') {
                paymentStatus = 'REFUNDED';
                paymentAmount = booking.totalAmount;
                refundAmount = booking.totalAmount; // Full refund on cancellation
            } else {
                // PENDING
                paymentStatus = 'PENDING';
                paymentAmount = booking.totalAmount;
                refundAmount = 0;
            }

            payments.push({
                bookingId: booking._id,
                amount: paymentAmount,
                paymentStatus,
                refundAmount,
                createdAt: booking.createdAt
            });
        }

        await Payment.insertMany(payments);
        console.log(`  Created ${payments.length} payments`);

        // 4. Rebuild daily analytics from the real data
        console.log('Rebuilding daily analytics from seeded data...');
        const dailyRecords = await analyticsService.rebuildDailyAnalytics(60);
        console.log(`  Created ${dailyRecords.length} daily analytics records`);

        // 5. Create a few sample alerts
        console.log('Creating sample alerts...');
        await Alert.insertMany([
            {
                type: 'REVENUE_LEAK',
                description: 'Detected 2 refund(s) exceeding Rs. 50,000. Total refund amount: Rs. 72,500.',
                severity: 'HIGH',
                status: 'ACTIVE',
                createdAt: new Date(today.getTime() - 2 * 86400000)
            },
            {
                type: 'HIGH_CANCELLATION',
                description: '7 bookings cancelled in a single day, exceeding the threshold of 5.',
                severity: 'MEDIUM',
                status: 'ACTIVE',
                createdAt: new Date(today.getTime() - 5 * 86400000)
            },
            {
                type: 'REVENUE_DROP',
                description: "Yesterday's revenue (Rs. 18,500) is below 60% of the 30-day average (Rs. 52,000).",
                severity: 'HIGH',
                status: 'RESOLVED',
                createdAt: new Date(today.getTime() - 10 * 86400000)
            }
        ]);

        // Summary
        console.log('\n========================================');
        console.log('  SEED COMPLETE');
        console.log('========================================');
        console.log(`  Rooms:      ${ROOM_TYPES.length} types (${ROOM_TYPES.reduce((s, r) => s + r.totalRooms, 0)} total rooms)`);
        console.log(`  Bookings:   ${insertedBookings.length}`);
        console.log(`  Payments:   ${payments.length}`);
        console.log(`  Analytics:  ${dailyRecords.length} daily records`);
        console.log(`  Alerts:     3 sample alerts`);
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seedDatabase();
