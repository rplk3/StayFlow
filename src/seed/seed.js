const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Hall = require('../models/Hall');
const EventBooking = require('../models/EventBooking');

const halls = [
    {
        name: 'Grand Ballroom',
        description: 'Our flagship venue featuring crystal chandeliers, marble floors, and a grand stage. Perfect for weddings, galas, and large corporate events.',
        capacity: 500,
        priceModel: 'PER_HOUR',
        pricePerHour: 15000,
        facilities: ['Stage', 'AC', 'Parking', 'WiFi', 'Projector', 'Sound System', 'Dance Floor', 'Bridal Suite'],
        images: ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'],
        rules: 'No outside catering without prior approval. Decorations must be removed by midnight. Maximum noise level applies after 10 PM.',
        isActive: true
    },
    {
        name: 'Crystal Hall',
        description: 'An elegant mid-sized hall with modern glass architecture and ambient lighting. Ideal for conferences, seminars, and medium-sized celebrations.',
        capacity: 200,
        priceModel: 'PER_HOUR',
        pricePerHour: 8000,
        facilities: ['AC', 'WiFi', 'Projector', 'Sound System', 'Parking', 'Podium'],
        images: ['https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800'],
        rules: 'Setup must be completed 1 hour before event. Clean-up responsibility lies with the booking party.',
        isActive: true
    },
    {
        name: 'Garden Pavilion',
        description: 'A beautiful outdoor pavilion surrounded by manicured gardens and fountains. Weather-dependent with a retractable canopy for rain protection.',
        capacity: 150,
        priceModel: 'FIXED',
        fixedPrice: 45000,
        facilities: ['Parking', 'WiFi', 'Outdoor Stage', 'Garden Lighting', 'Gazebo'],
        images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'],
        rules: 'Weather-dependent. Rain date must be specified. No fireworks or sky lanterns. Music must stop by 10 PM.',
        isActive: true
    },
    {
        name: 'Executive Boardroom',
        description: 'A premium boardroom with state-of-the-art AV equipment, video conferencing, and executive leather seating.',
        capacity: 30,
        priceModel: 'PER_HOUR',
        pricePerHour: 3000,
        facilities: ['AC', 'WiFi', 'Projector', 'Video Conferencing', 'Whiteboard', 'Coffee Machine'],
        images: ['https://images.unsplash.com/photo-1431540015169-0645f5be7506?w=800'],
        rules: 'Minimum booking 2 hours. Food and beverages only from hotel kitchen.',
        isActive: true
    },
    {
        name: 'Riverside Terrace',
        description: 'An open-air terrace overlooking the river with stunning sunset views. Perfect for cocktail parties and intimate gatherings.',
        capacity: 100,
        priceModel: 'FIXED',
        fixedPrice: 35000,
        facilities: ['Parking', 'WiFi', 'Bar Counter', 'Ambient Lighting', 'River View'],
        images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800'],
        rules: 'No glass items near the railing. Event must conclude by 11 PM. Smoking only in designated areas.',
        isActive: true
    },
    {
        name: 'Heritage Room',
        description: 'A charming heritage-style room with vintage decor, wooden paneling, and antique furniture. Great for intimate meetings and private dining.',
        capacity: 50,
        priceModel: 'PER_HOUR',
        pricePerHour: 5000,
        facilities: ['AC', 'WiFi', 'Parking', 'Fireplace', 'Private Dining Setup'],
        images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'],
        rules: 'No adhesive decorations on walls. Antique furniture must not be moved. Maximum 50 guests strictly enforced.',
        isActive: true
    }
];

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

async function seed() {
    try {
        await connectDB();
        console.log('Clearing existing data...');
        await Hall.deleteMany({});
        await EventBooking.deleteMany({});

        console.log('Inserting halls...');
        const createdHalls = await Hall.insertMany(halls);
        console.log(`Inserted ${createdHalls.length} halls`);

        const grandBallroom = createdHalls[0];
        const crystalHall = createdHalls[1];
        const gardenPavilion = createdHalls[2];
        const boardroom = createdHalls[3];
        const terrace = createdHalls[4];
        const heritage = createdHalls[5];

        const bookings = [
            // 1. Approved wedding in Grand Ballroom - 7 days from now
            {
                bookingRef: 'EVT-2026-0001',
                userId: 'user1',
                customerName: 'Sarah Johnson',
                customerEmail: 'sarah.johnson@email.com',
                customerPhone: '+94-77-1234567',
                hallId: grandBallroom._id,
                hallSnapshot: { name: grandBallroom.name, capacity: grandBallroom.capacity, priceModel: 'PER_HOUR', pricePerHour: 15000 },
                eventType: 'WEDDING',
                eventDate: addDays(today, 7),
                startTime: '10:00',
                endTime: '16:00',
                durationHours: 6,
                guestsCount: 350,
                services: {
                    catering: { selected: true, pricePerPerson: 2500, menu: 'Premium Wedding Package - 5 course meal' },
                    decoration: { selected: true, price: 75000, notes: 'Rose and lily floral arrangements, fairy lights' },
                    audioVisual: { selected: true, price: 25000 },
                    extraItems: [{ name: 'Extra Round Tables', unitPrice: 1500, qty: 10 }]
                },
                specialRequests: 'Need a separate area for a photobooth',
                pricing: { hallCost: 90000, servicesCost: 990000, subtotal: 1080000, tax: 108000, total: 1188000 },
                status: 'APPROVED',
                adminDecision: { decidedBy: 'admin1', decidedAt: new Date(), adminNotes: 'VIP client - ensure best service' }
            },
            // 2. Pending conference in Crystal Hall - 10 days from now
            {
                bookingRef: 'EVT-2026-0002',
                userId: 'user2',
                customerName: 'Michael Chen',
                customerEmail: 'michael.chen@techcorp.com',
                customerPhone: '+94-77-2345678',
                hallId: crystalHall._id,
                hallSnapshot: { name: crystalHall.name, capacity: crystalHall.capacity, priceModel: 'PER_HOUR', pricePerHour: 8000 },
                eventType: 'CONFERENCE',
                eventDate: addDays(today, 10),
                startTime: '09:00',
                endTime: '17:00',
                durationHours: 8,
                guestsCount: 180,
                services: {
                    catering: { selected: true, pricePerPerson: 1200, menu: 'Business lunch buffet' },
                    decoration: { selected: false, price: 0, notes: '' },
                    audioVisual: { selected: true, price: 15000 },
                    extraItems: [{ name: 'Name Tags', unitPrice: 50, qty: 200 }]
                },
                specialRequests: 'Need 3 breakout rooms for workshops',
                pricing: { hallCost: 64000, servicesCost: 241000, subtotal: 305000, tax: 30500, total: 335500 },
                status: 'PENDING'
            },
            // 3. Approved party at Garden Pavilion - 5 days from now
            {
                bookingRef: 'EVT-2026-0003',
                userId: 'user3',
                customerName: 'Priya Sharma',
                customerEmail: 'priya.sharma@email.com',
                customerPhone: '+94-77-3456789',
                hallId: gardenPavilion._id,
                hallSnapshot: { name: gardenPavilion.name, capacity: gardenPavilion.capacity, priceModel: 'FIXED', fixedPrice: 45000 },
                eventType: 'PARTY',
                eventDate: addDays(today, 5),
                startTime: '17:00',
                endTime: '22:00',
                durationHours: 5,
                guestsCount: 120,
                services: {
                    catering: { selected: true, pricePerPerson: 1800, menu: 'BBQ garden party menu' },
                    decoration: { selected: true, price: 30000, notes: 'Tropical theme with tiki torches' },
                    audioVisual: { selected: true, price: 20000 },
                    extraItems: []
                },
                specialRequests: 'Live band will perform from 8-10 PM',
                pricing: { hallCost: 45000, servicesCost: 266000, subtotal: 311000, tax: 31100, total: 342100 },
                status: 'APPROVED',
                adminDecision: { decidedBy: 'admin1', decidedAt: new Date(), adminNotes: 'Confirmed rain date: +2 days' }
            },
            // 4. Pending meeting in Boardroom - 3 days from now
            {
                bookingRef: 'EVT-2026-0004',
                userId: 'user4',
                customerName: 'David Williams',
                customerEmail: 'david.w@company.com',
                customerPhone: '+94-77-4567890',
                hallId: boardroom._id,
                hallSnapshot: { name: boardroom.name, capacity: boardroom.capacity, priceModel: 'PER_HOUR', pricePerHour: 3000 },
                eventType: 'MEETING',
                eventDate: addDays(today, 3),
                startTime: '10:00',
                endTime: '13:00',
                durationHours: 3,
                guestsCount: 25,
                services: {
                    catering: { selected: true, pricePerPerson: 500, menu: 'Tea/coffee and snacks' },
                    decoration: { selected: false, price: 0, notes: '' },
                    audioVisual: { selected: false, price: 0 },
                    extraItems: []
                },
                specialRequests: 'Need video conferencing setup for remote participants',
                pricing: { hallCost: 9000, servicesCost: 12500, subtotal: 21500, tax: 2150, total: 23650 },
                status: 'PENDING'
            },
            // 5. Rejected booking at Grand Ballroom - 14 days from now
            {
                bookingRef: 'EVT-2026-0005',
                userId: 'user5',
                customerName: 'Amanda Torres',
                customerEmail: 'amanda.t@email.com',
                customerPhone: '+94-77-5678901',
                hallId: grandBallroom._id,
                hallSnapshot: { name: grandBallroom.name, capacity: grandBallroom.capacity, priceModel: 'PER_HOUR', pricePerHour: 15000 },
                eventType: 'PARTY',
                eventDate: addDays(today, 14),
                startTime: '19:00',
                endTime: '23:00',
                durationHours: 4,
                guestsCount: 200,
                services: {
                    catering: { selected: true, pricePerPerson: 2000, menu: 'Cocktail party menu' },
                    decoration: { selected: true, price: 50000, notes: 'Neon theme' },
                    audioVisual: { selected: true, price: 30000 },
                    extraItems: []
                },
                specialRequests: '',
                pricing: { hallCost: 60000, servicesCost: 480000, subtotal: 540000, tax: 54000, total: 594000 },
                status: 'REJECTED',
                adminDecision: { decidedBy: 'admin1', decidedAt: new Date(), reason: 'Hall under maintenance on that date', adminNotes: 'Suggested alternative date' }
            },
            // 6. Cancelled event at Crystal Hall
            {
                bookingRef: 'EVT-2026-0006',
                userId: 'user2',
                customerName: 'Michael Chen',
                customerEmail: 'michael.chen@techcorp.com',
                customerPhone: '+94-77-2345678',
                hallId: crystalHall._id,
                hallSnapshot: { name: crystalHall.name, capacity: crystalHall.capacity, priceModel: 'PER_HOUR', pricePerHour: 8000 },
                eventType: 'MEETING',
                eventDate: addDays(today, -5),
                startTime: '14:00',
                endTime: '17:00',
                durationHours: 3,
                guestsCount: 50,
                services: {
                    catering: { selected: false },
                    decoration: { selected: false },
                    audioVisual: { selected: true, price: 10000 },
                    extraItems: []
                },
                specialRequests: '',
                pricing: { hallCost: 24000, servicesCost: 10000, subtotal: 34000, tax: 3400, total: 37400 },
                status: 'CANCELLED'
            },
            // 7. Approved event at Riverside Terrace - 8 days from now
            {
                bookingRef: 'EVT-2026-0007',
                userId: 'user6',
                customerName: 'Lisa Park',
                customerEmail: 'lisa.park@email.com',
                customerPhone: '+94-77-6789012',
                hallId: terrace._id,
                hallSnapshot: { name: terrace.name, capacity: terrace.capacity, priceModel: 'FIXED', fixedPrice: 35000 },
                eventType: 'PARTY',
                eventDate: addDays(today, 8),
                startTime: '18:00',
                endTime: '22:00',
                durationHours: 4,
                guestsCount: 80,
                services: {
                    catering: { selected: true, pricePerPerson: 2200, menu: 'Sunset cocktail menu with tapas' },
                    decoration: { selected: true, price: 25000, notes: 'Sunset theme with lanterns' },
                    audioVisual: { selected: false, price: 0 },
                    extraItems: [{ name: 'Bar Stools', unitPrice: 800, qty: 20 }]
                },
                specialRequests: 'DJ booth setup near the bar',
                pricing: { hallCost: 35000, servicesCost: 217000, subtotal: 252000, tax: 25200, total: 277200 },
                status: 'APPROVED',
                adminDecision: { decidedBy: 'admin1', decidedAt: new Date(), adminNotes: 'Confirmed' }
            },
            // 8. Pending conference in Heritage Room - 12 days from now
            {
                bookingRef: 'EVT-2026-0008',
                userId: 'user7',
                customerName: 'Robert Kim',
                customerEmail: 'robert.kim@startup.io',
                customerPhone: '+94-77-7890123',
                hallId: heritage._id,
                hallSnapshot: { name: heritage.name, capacity: heritage.capacity, priceModel: 'PER_HOUR', pricePerHour: 5000 },
                eventType: 'MEETING',
                eventDate: addDays(today, 12),
                startTime: '09:00',
                endTime: '12:00',
                durationHours: 3,
                guestsCount: 30,
                services: {
                    catering: { selected: true, pricePerPerson: 800, menu: 'Continental breakfast + lunch' },
                    decoration: { selected: false, price: 0, notes: '' },
                    audioVisual: { selected: true, price: 8000 },
                    extraItems: []
                },
                specialRequests: 'Private dining setup for lunch break',
                pricing: { hallCost: 15000, servicesCost: 32000, subtotal: 47000, tax: 4700, total: 51700 },
                status: 'PENDING'
            },
            // 9. Approved wedding at Grand Ballroom - 20 days from now
            {
                bookingRef: 'EVT-2026-0009',
                userId: 'user8',
                customerName: 'Emma Thompson',
                customerEmail: 'emma.t@email.com',
                customerPhone: '+94-77-8901234',
                hallId: grandBallroom._id,
                hallSnapshot: { name: grandBallroom.name, capacity: grandBallroom.capacity, priceModel: 'PER_HOUR', pricePerHour: 15000 },
                eventType: 'WEDDING',
                eventDate: addDays(today, 20),
                startTime: '11:00',
                endTime: '18:00',
                durationHours: 7,
                guestsCount: 400,
                services: {
                    catering: { selected: true, pricePerPerson: 3000, menu: 'Luxury wedding feast - 7 course' },
                    decoration: { selected: true, price: 120000, notes: 'Full floral, arch, draping, centerpieces' },
                    audioVisual: { selected: true, price: 35000 },
                    extraItems: [{ name: 'Red Carpet', unitPrice: 5000, qty: 1 }, { name: 'Photo Backdrop', unitPrice: 8000, qty: 1 }]
                },
                specialRequests: 'Fireworks at 8 PM, live string quartet during dinner',
                pricing: { hallCost: 105000, servicesCost: 1388000, subtotal: 1493000, tax: 149300, total: 1642300 },
                status: 'APPROVED',
                adminDecision: { decidedBy: 'admin1', decidedAt: new Date(), adminNotes: 'Premium package - assign senior event coordinator' }
            },
            // 10. Pending meeting at Boardroom - 3 days from now (same as #4 - overlap test!)
            {
                bookingRef: 'EVT-2026-0010',
                userId: 'user9',
                customerName: 'James Wright',
                customerEmail: 'j.wright@corp.com',
                customerPhone: '+94-77-9012345',
                hallId: boardroom._id,
                hallSnapshot: { name: boardroom.name, capacity: boardroom.capacity, priceModel: 'PER_HOUR', pricePerHour: 3000 },
                eventType: 'MEETING',
                eventDate: addDays(today, 3),
                startTime: '11:00',
                endTime: '14:00',
                durationHours: 3,
                guestsCount: 20,
                services: {
                    catering: { selected: true, pricePerPerson: 600, menu: 'Working lunch' },
                    decoration: { selected: false, price: 0, notes: '' },
                    audioVisual: { selected: true, price: 5000 },
                    extraItems: []
                },
                specialRequests: 'Need NDA signed by all attendees',
                pricing: { hallCost: 9000, servicesCost: 17000, subtotal: 26000, tax: 2600, total: 28600 },
                status: 'PENDING'
            },
            // 11. Pending party at Riverside Terrace - 8 days from now (partial overlap with #7!)
            {
                bookingRef: 'EVT-2026-0011',
                userId: 'user10',
                customerName: 'Natasha Rivera',
                customerEmail: 'natasha.r@email.com',
                customerPhone: '+94-77-1122334',
                hallId: terrace._id,
                hallSnapshot: { name: terrace.name, capacity: terrace.capacity, priceModel: 'FIXED', fixedPrice: 35000 },
                eventType: 'PARTY',
                eventDate: addDays(today, 8),
                startTime: '20:00',
                endTime: '23:00',
                durationHours: 3,
                guestsCount: 60,
                services: {
                    catering: { selected: true, pricePerPerson: 1500, menu: 'Late night menu' },
                    decoration: { selected: false, price: 0, notes: '' },
                    audioVisual: { selected: true, price: 15000 },
                    extraItems: []
                },
                specialRequests: 'Birthday surprise at midnight',
                pricing: { hallCost: 35000, servicesCost: 105000, subtotal: 140000, tax: 14000, total: 154000 },
                status: 'PENDING'
            },
            // 12. Past approved event at Crystal Hall
            {
                bookingRef: 'EVT-2026-0012',
                userId: 'user1',
                customerName: 'Sarah Johnson',
                customerEmail: 'sarah.johnson@email.com',
                customerPhone: '+94-77-1234567',
                hallId: crystalHall._id,
                hallSnapshot: { name: crystalHall.name, capacity: crystalHall.capacity, priceModel: 'PER_HOUR', pricePerHour: 8000 },
                eventType: 'CONFERENCE',
                eventDate: addDays(today, -10),
                startTime: '09:00',
                endTime: '16:00',
                durationHours: 7,
                guestsCount: 150,
                services: {
                    catering: { selected: true, pricePerPerson: 1500, menu: 'Full day conference package' },
                    decoration: { selected: false, price: 0, notes: '' },
                    audioVisual: { selected: true, price: 20000 },
                    extraItems: []
                },
                specialRequests: '',
                pricing: { hallCost: 56000, servicesCost: 245000, subtotal: 301000, tax: 30100, total: 331100 },
                status: 'APPROVED',
                adminDecision: { decidedBy: 'admin1', decidedAt: addDays(today, -15) }
            },
            // 13. Pending wedding at Garden Pavilion - 15 days from now
            {
                bookingRef: 'EVT-2026-0013',
                userId: 'user11',
                customerName: 'Carlos Mendez',
                customerEmail: 'carlos.m@email.com',
                customerPhone: '+94-77-2233445',
                hallId: gardenPavilion._id,
                hallSnapshot: { name: gardenPavilion.name, capacity: gardenPavilion.capacity, priceModel: 'FIXED', fixedPrice: 45000 },
                eventType: 'WEDDING',
                eventDate: addDays(today, 15),
                startTime: '15:00',
                endTime: '21:00',
                durationHours: 6,
                guestsCount: 130,
                services: {
                    catering: { selected: true, pricePerPerson: 2800, menu: 'Wedding reception dinner' },
                    decoration: { selected: true, price: 55000, notes: 'Garden wedding theme with arch' },
                    audioVisual: { selected: true, price: 18000 },
                    extraItems: [{ name: 'Garden Chairs', unitPrice: 500, qty: 50 }]
                },
                specialRequests: 'Ceremony at gazebo, reception at main pavilion',
                pricing: { hallCost: 45000, servicesCost: 462000, subtotal: 507000, tax: 50700, total: 557700 },
                status: 'PENDING'
            },
            // 14. Pending OTHER event at Heritage Room - 6 days from now
            {
                bookingRef: 'EVT-2026-0014',
                userId: 'user12',
                customerName: 'Olivia Zhang',
                customerEmail: 'olivia.z@artgallery.com',
                customerPhone: '+94-77-3344556',
                hallId: heritage._id,
                hallSnapshot: { name: heritage.name, capacity: heritage.capacity, priceModel: 'PER_HOUR', pricePerHour: 5000 },
                eventType: 'OTHER',
                eventDate: addDays(today, 6),
                startTime: '10:00',
                endTime: '18:00',
                durationHours: 8,
                guestsCount: 40,
                services: {
                    catering: { selected: true, pricePerPerson: 1000, menu: 'Wine and cheese reception' },
                    decoration: { selected: true, price: 20000, notes: 'Art exhibition display stands and lighting' },
                    audioVisual: { selected: false, price: 0 },
                    extraItems: [{ name: 'Display Easels', unitPrice: 2000, qty: 15 }]
                },
                specialRequests: 'Art gallery exhibition - need careful handling of artwork',
                pricing: { hallCost: 40000, servicesCost: 90000, subtotal: 130000, tax: 13000, total: 143000 },
                status: 'PENDING'
            },
            // 15. Approved conference at Grand Ballroom - 25 days from now
            {
                bookingRef: 'EVT-2026-0015',
                userId: 'user13',
                customerName: 'Daniel Foster',
                customerEmail: 'daniel.f@megacorp.com',
                customerPhone: '+94-77-4455667',
                hallId: grandBallroom._id,
                hallSnapshot: { name: grandBallroom.name, capacity: grandBallroom.capacity, priceModel: 'PER_HOUR', pricePerHour: 15000 },
                eventType: 'CONFERENCE',
                eventDate: addDays(today, 25),
                startTime: '08:00',
                endTime: '18:00',
                durationHours: 10,
                guestsCount: 450,
                services: {
                    catering: { selected: true, pricePerPerson: 1500, menu: 'Full day corporate catering' },
                    decoration: { selected: true, price: 40000, notes: 'Corporate branding and banners' },
                    audioVisual: { selected: true, price: 50000 },
                    extraItems: [{ name: 'Registration Desk', unitPrice: 3000, qty: 2 }]
                },
                specialRequests: 'Multiple presentation stages, simultaneous translation booths',
                pricing: { hallCost: 150000, servicesCost: 771000, subtotal: 921000, tax: 92100, total: 1013100 },
                status: 'APPROVED',
                adminDecision: { decidedBy: 'admin1', decidedAt: new Date(), adminNotes: 'Major corporate client - priority' }
            }
        ];

        console.log('Inserting bookings...');
        await EventBooking.insertMany(bookings);
        console.log(`Inserted ${bookings.length} bookings`);

        console.log('\n--- Overlap Test Data ---');
        console.log(`Booking #4 (EVT-2026-0004): Boardroom, ${addDays(today, 3).toDateString()}, 10:00-13:00 [PENDING]`);
        console.log(`Booking #10 (EVT-2026-0010): Boardroom, ${addDays(today, 3).toDateString()}, 11:00-14:00 [PENDING] <-- OVERLAPS with #4`);
        console.log(`Booking #7 (EVT-2026-0007): Terrace, ${addDays(today, 8).toDateString()}, 18:00-22:00 [APPROVED]`);
        console.log(`Booking #11 (EVT-2026-0011): Terrace, ${addDays(today, 8).toDateString()}, 20:00-23:00 [PENDING] <-- OVERLAPS with #7`);

        console.log('\nSeed completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
