require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const AnalyticsDaily = require('./models/AnalyticsDaily');
const Alert = require('./models/Alert');
const Hotel = require('./models/Hotel');
const Room = require('./src/modules/hotelRoom/models/Room');
const User = require('./src/modules/auth/models/User');

const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Penthouse'];
const statuses = ['confirmed', 'cancelled', 'completed'];

const hotelData = [
    { name: 'Shangri-La Colombo', destination: 'Colombo', city: 'Colombo', country: 'Sri Lanka', address: '1 Galle Face, Colombo 02', phone: '+94 11 788 8288', email: 'info@shangri-la.com', starRating: 5, priceRange: 'ultra-luxury', description: 'Luxury waterfront hotel with stunning ocean views and world-class amenities.', amenities: ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service', 'Valet Parking'] },
    { name: 'Cinnamon Grand', destination: 'Colombo', city: 'Colombo', country: 'Sri Lanka', address: '77 Galle Road, Colombo 03', phone: '+94 11 243 7437', email: 'info@cinnamongrand.com', starRating: 5, priceRange: 'luxury', description: 'Iconic 5-star hotel in the heart of Colombo offering premium hospitality.', amenities: ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Business Center'] },
    { name: 'Hilton Colombo', destination: 'Colombo', city: 'Colombo', country: 'Sri Lanka', address: '2 Sir Chittampalam A Gardiner Mawatha', phone: '+94 11 249 2492', email: 'colombo@hilton.com', starRating: 5, priceRange: 'luxury', description: 'International luxury chain hotel with panoramic city views.', amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Fitness Center'] },
    { name: 'Kandy House', destination: 'Kandy', city: 'Kandy', country: 'Sri Lanka', address: 'Amunugama, Gunnepana', phone: '+94 81 492 1394', email: 'info@kandyhouse.com', starRating: 4, priceRange: 'luxury', description: 'Boutique heritage property set in a restored 200-year-old manor.', amenities: ['Free WiFi', 'Pool', 'Garden', 'Restaurant', 'Cultural Tours'] },
    { name: 'OZO Kandy', destination: 'Kandy', city: 'Kandy', country: 'Sri Lanka', address: '35 Sangaraja Mawatha', phone: '+94 81 203 5555', email: 'kandy@ozohotels.com', starRating: 4, priceRange: 'mid-range', description: 'Modern hotel overlooking Kandy Lake with contemporary design.', amenities: ['Free WiFi', 'Pool', 'Restaurant', 'Gym', 'Rooftop Bar'] },
    { name: 'Amari Galle', destination: 'Galle', city: 'Galle', country: 'Sri Lanka', address: '68 Lighthouse Street, Fort', phone: '+94 91 223 3388', email: 'info@amari-galle.com', starRating: 5, priceRange: 'luxury', description: 'Premium beachfront resort near the historic Galle Fort.', amenities: ['Free WiFi', 'Beach Access', 'Pool', 'Spa', 'Restaurant', 'Bar'] },
    { name: 'Le Grand Galle', destination: 'Galle', city: 'Galle', country: 'Sri Lanka', address: '30 Church Street, Fort', phone: '+94 91 234 7878', email: 'stay@legrandgalle.com', starRating: 3, priceRange: 'mid-range', description: 'Charming colonial-style hotel inside Galle Fort walls.', amenities: ['Free WiFi', 'Restaurant', 'Heritage Tours', 'Garden'] },
    { name: 'Heritance Tea Factory', destination: 'Nuwara Eliya', city: 'Nuwara Eliya', country: 'Sri Lanka', address: 'Kandapola', phone: '+94 52 555 0000', email: 'teafactory@heritancehotels.com', starRating: 5, priceRange: 'luxury', description: 'Unique hotel converted from a tea factory set among tea plantations.', amenities: ['Free WiFi', 'Spa', 'Restaurant', 'Tea Tasting', 'Hiking Trails'] },
    { name: 'Ella Flower Garden', destination: 'Ella', city: 'Ella', country: 'Sri Lanka', address: 'Passara Road, Ella', phone: '+94 57 222 8878', email: 'stay@ellaflower.com', starRating: 3, priceRange: 'budget', description: 'Cozy guesthouse with stunning mountain views in Ella.', amenities: ['Free WiFi', 'Garden', 'Restaurant', 'Trekking'] },
    { name: 'Grand Udawalawe Safari', destination: 'Udawalawe', city: 'Udawalawe', country: 'Sri Lanka', address: 'Udawalawe National Park Road', phone: '+94 47 223 3344', email: 'info@udawalawesafari.com', starRating: 4, priceRange: 'mid-range', description: 'Safari lodge near Udawalawe National Park, perfect for wildlife enthusiasts.', amenities: ['Free WiFi', 'Pool', 'Safari Tours', 'Restaurant', 'Campfire'] },
];

const roomTemplates = [
    { roomType: 'Standard', capacity: 2, basePrice: 8000, totalRooms: 20, amenities: ['TV', 'Air Conditioning', 'Mini Fridge'] },
    { roomType: 'Deluxe', capacity: 3, basePrice: 15000, totalRooms: 15, amenities: ['TV', 'Air Conditioning', 'Mini Bar', 'Bathtub', 'City View'] },
    { roomType: 'Suite', capacity: 4, basePrice: 28000, totalRooms: 8, amenities: ['TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Living Room', 'Ocean View'] },
    { roomType: 'Penthouse', capacity: 6, basePrice: 55000, totalRooms: 2, amenities: ['TV', 'Air Conditioning', 'Full Bar', 'Private Pool', 'Butler Service', 'Panoramic View'] },
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB. Clearing old data...');

        await Booking.deleteMany({});
        await Payment.deleteMany({});
        await AnalyticsDaily.deleteMany({});
        await Alert.deleteMany({});
        await Hotel.deleteMany({});
        await Room.deleteMany({});

        console.log('Seeding new dummy data...');
        
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

        console.log('Seeding hotels and rooms...');
        const roomStatuses = ['available', 'available', 'available', 'occupied', 'maintenance'];
        
        for (const hd of hotelData) {
            const hotel = await Hotel.create({
                ...hd,
                status: 'active',
                images: [`https://loremflickr.com/400/250/hotel,${hd.city.replace(' ', '')}`]
            });

            // Create rooms for each hotel
            for (const rt of roomTemplates) {
                for (let r = 1; r <= Math.min(rt.totalRooms, 3); r++) {
                    const floor = Math.floor(Math.random() * 5) + 1;
                    await Room.create({
                        hotelId: hotel._id,
                        roomNumber: `${floor}${String(r).padStart(2, '0')}`,
                        roomType: rt.roomType,
                        capacity: rt.capacity,
                        floor: floor,
                        description: `${rt.roomType} room on floor ${floor}`,
                        amenities: rt.amenities,
                        totalRooms: rt.totalRooms,
                        basePrice: rt.basePrice + Math.floor(Math.random() * 5000),
                        status: roomStatuses[Math.floor(Math.random() * roomStatuses.length)],
                        images: []
                    });
                }
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
