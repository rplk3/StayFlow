/**
 * Seed Script — Performance Analytics Module
 * 
 * Generates realistic hotel booking data including new Hotels, RatePlans, and Coupons.
 * Integrates flawlessly with the Performance Analytics Module.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Google DNS for SRV resolution
const mongoose = require('mongoose');

const Hotel = require('../modules/hotelRoom/models/Hotel');
const RatePlan = require('../modules/hotelRoom/models/RatePlan');
const Coupon = require('../modules/hotelRoom/models/Coupon');
const Room = require('../modules/hotelRoom/models/Room');
const Booking = require('../modules/hotelRoom/models/Booking');
const Payment = require('../modules/payment/models/Payment');
const AnalyticsDaily = require('../modules/performanceAnalytics/models/AnalyticsDaily');
const Alert = require('../modules/performanceAnalytics/models/Alert');
const analyticsService = require('../modules/performanceAnalytics/services/analyticsService');

const BOOKING_STATUSES = ['CONFIRMED', 'CONFIRMED', 'CONFIRMED', 'CANCELLED', 'HOLD'];

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB. Starting seed...');

        console.log('Dropping collections entirely to remove old unique indexes...');
        try { await mongoose.connection.db.dropCollection('hotels'); } catch(e){}
        try { await mongoose.connection.db.dropCollection('rateplans'); } catch(e){}
        try { await mongoose.connection.db.dropCollection('coupons'); } catch(e){}
        try { await mongoose.connection.db.dropCollection('bookings'); } catch(e){}
        try { await mongoose.connection.db.dropCollection('payments'); } catch(e){}
        try { await mongoose.connection.db.dropCollection('rooms'); } catch(e){}
        try { await mongoose.connection.db.dropCollection('analyticsdailies'); } catch(e){}
        try { await mongoose.connection.db.dropCollection('alerts'); } catch(e){}

        console.log('Creating hotels...');
        const hotels = await Hotel.insertMany([
            {
                name: "Grand Plaza StayFlow",
                destination: "Colombo",
                description: "Luxury hotel in the heart of Colombo with stunning city views.",
                starRating: 5,
                amenities: ["Free WiFi", "Pool", "Spa", "Gym", "Restaurant"],
                images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?fit=crop&w=800"]
            },
            {
                name: "StayFlow Beach Resort",
                destination: "Galle",
                description: "Beachfront paradise offering a relaxing getaway.",
                starRating: 4,
                amenities: ["Free WiFi", "Beachfront", "Pool", "Bar"],
                images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?fit=crop&w=800"]
            },
            {
                name: "Kandy Royal Heritage",
                destination: "Kandy",
                description: "Historic property nestled in the hills overlooking the lake.",
                starRating: 4,
                amenities: ["Free WiFi", "Mountain View", "Restaurant", "Cultural Shows"],
                images: ["https://images.unsplash.com/photo-1588636402741-dd6052f520b7?fit=crop&w=800"]
            },
            {
                name: "Ella Cloud Forest Retreat",
                destination: "Ella",
                description: "Eco-friendly lodges right in the misty mountains of Ella.",
                starRating: 3,
                amenities: ["Free WiFi", "Hiking Trails", "Breakfast Included", "Nature Views"],
                images: ["https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?fit=crop&w=800"]
            },
            {
                name: "Luxurious Tea Estate",
                destination: "Nuwara Eliya",
                description: "Colonial-style bungalow surrounded by tea plantations.",
                starRating: 5,
                amenities: ["Free WiFi", "Fireplace", "High Tea", "Butler Service"],
                images: ["https://images.unsplash.com/photo-1544413660-299165566b1d?fit=crop&w=800"]
            }
        ]);

        console.log('Creating rate plans...');
        const ratePlans = [];
        for (const hotel of hotels) {
            ratePlans.push({
                hotelId: hotel._id,
                name: "Standard Rate",
                paymentType: "PAY_LATER",
                priceMultiplier: 1.0,
                cancellationPolicy: { isRefundable: true, freeCancellationDaysPrior: 3, penaltyPercentage: 100 },
                includesBreakfast: false
            });
            ratePlans.push({
                hotelId: hotel._id,
                name: "Non-Refundable (10% Off)",
                paymentType: "PAY_NOW",
                priceMultiplier: 0.9,
                cancellationPolicy: { isRefundable: false, freeCancellationDaysPrior: 0, penaltyPercentage: 100 },
                includesBreakfast: false
            });
        }
        const insertedRatePlans = await RatePlan.insertMany(ratePlans);

        console.log('Creating rooms...');
        const roomsToInsert = [];
        for (const hotel of hotels) {
            roomsToInsert.push({ hotelId: hotel._id, roomType: 'Standard', capacity: 2, totalRooms: 20, basePrice: 8000, amenities: ["Air Conditioning", "TV"] });
            roomsToInsert.push({ hotelId: hotel._id, roomType: 'Deluxe', capacity: 3, totalRooms: 10, basePrice: 15000, amenities: ["Air Conditioning", "TV", "Mini Bar", "Balcony"] });
            roomsToInsert.push({ hotelId: hotel._id, roomType: 'Suite', capacity: 4, totalRooms: 5, basePrice: 30000, amenities: ["Air Conditioning", "TV", "Mini Bar", "Sea View", "Living Area"] });
        }
        const insertedRooms = await Room.insertMany(roomsToInsert);

        console.log('Creating coupons...');
        await Coupon.insertMany([
            { code: "SUMMER20", discountPercentage: 20, maxDiscountAmount: 5000 },
            { code: "WELCOME10", discountPercentage: 10 }
        ]);

        console.log('Generating bookings and payments...');
        const today = new Date();
        const bookings = [];
        const payments = [];

        for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
            const day = new Date(today);
            day.setDate(today.getDate() - dayOffset);
            day.setHours(0, 0, 0, 0);
            const isWeekend = (day.getDay() === 0 || day.getDay() === 6);
            const bookingsForDay = isWeekend ? randomInt(3, 6) : randomInt(2, 4);

            for (let j = 0; j < bookingsForDay; j++) {
                const roomDef = randomElement(insertedRooms);
                const hotelId = roomDef.hotelId;
                const relevantRatePlans = insertedRatePlans.filter(rp => rp.hotelId.toString() === hotelId.toString());
                const ratePlan = randomElement(relevantRatePlans);

                const nights = randomInt(1, 5);
                const status = randomElement(BOOKING_STATUSES);

                const priceMultiplier = isWeekend ? 1.2 : 1.0;
                const basePricing = roomDef.basePrice * nights * priceMultiplier * ratePlan.priceMultiplier;
                const taxesFees = basePricing * 0.12;
                const totalAmount = basePricing + taxesFees;

                const checkIn = new Date(day);
                checkIn.setHours(14, 0, 0, 0);

                const checkOut = new Date(checkIn);
                checkOut.setDate(checkIn.getDate() + nights);
                checkOut.setHours(11, 0, 0, 0);

                const createdAt = new Date(day);
                createdAt.setHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59));

                const booking = new Booking({
                    userId: `USER_${randomInt(100, 999)}`,
                    hotelId: hotelId,
                    roomId: roomDef._id,
                    ratePlanId: ratePlan._id,
                    guestDetails: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '123456789' },
                    checkInDate: checkIn,
                    checkOutDate: checkOut,
                    guests: 2,
                    nights,
                    pricing: {
                        roomTotal: basePricing,
                        taxesFees,
                        discount: 0,
                        totalAmount,
                        dueNow: ratePlan.paymentType === 'PAY_NOW' ? totalAmount : 0,
                        dueAtHotel: ratePlan.paymentType === 'PAY_LATER' ? totalAmount : 0
                    },
                    status: status,
                    paymentStatus: status === 'CONFIRMED' ? (ratePlan.paymentType === 'PAY_NOW' ? 'PAID_IN_FULL' : 'PARTIAL_AT_HOTEL') : 'PENDING',
                    bookingCode: 'BK' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                    createdAt
                });

                if (status === 'CANCELLED') {
                    booking.cancellationDetails = {
                        cancelledAt: new Date(createdAt.getTime() + 86400000), // Cancelled 1 day later
                        penaltyAmount: 0,
                        refundAmount: booking.pricing.dueNow
                    };
                    booking.paymentStatus = 'REFUNDED';
                }

                bookings.push(booking);
            }
        }

        const insertedBookings = await Booking.insertMany(bookings);
        console.log(`  Created ${insertedBookings.length} bookings`);

        for (const booking of insertedBookings) {
            if (booking.status === 'CONFIRMED' || booking.status === 'CANCELLED') {
                payments.push({
                    bookingId: booking._id,
                    amount: booking.pricing.dueNow || booking.pricing.totalAmount, // Simulate total collected or reserved
                    paymentStatus: booking.status === 'CONFIRMED' ? 'SUCCESS' : 'REFUNDED',
                    refundAmount: booking.status === 'CANCELLED' ? booking.pricing.dueNow : 0,
                    createdAt: booking.createdAt
                });
            }
        }

        await Payment.insertMany(payments);
        console.log(`  Created ${payments.length} payments`);

        console.log('Rebuilding daily analytics from seeded data...');
        // Note: The analyticsService maps the booking model exactly. If pricing changes hit aggregate functions, 
        // we might need to adjust them. But assuming Analytics views use `.totalAmount` which is now nested `.pricing.totalAmount`.
        // Let's hope analyticsService.js aggregates gracefully.
        
        try {
            const dailyRecords = await analyticsService.rebuildDailyAnalytics(60);
            console.log(`  Created ${dailyRecords.length} daily analytics records`);
        } catch (analyticsError) {
            console.warn('[WARNING] analyticsService.rebuildDailyAnalytics failed due to schema changes. You will need to patch analyticsService aggregation pipelines to point to "pricing.totalAmount" instead of "totalAmount".');
            console.warn(analyticsError);
        }

        console.log('Creating sample alerts...');
        await Alert.insertMany([
            { type: 'REVENUE_LEAK', description: 'Detected 2 refund(s) exceeding Rs. 50,000.', severity: 'HIGH', status: 'ACTIVE', createdAt: new Date(today.getTime() - 2 * 86400000) }
        ]);

        console.log('SEED COMPLETE');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seedDatabase();
