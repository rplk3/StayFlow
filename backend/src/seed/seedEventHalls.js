/**
 * Seed Script — Event Halls
 * 
 * Drops existing event halls and inserts 10 detailed halls with realistic Sri Lankan venues.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const EventHall = require('../modules/eventHall/models/EventHall');

async function seedEventHalls() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB. Seeding event halls...');

        // Drop existing event halls
        try { await mongoose.connection.db.dropCollection('eventhalls'); } catch (e) { }
        console.log('Cleared existing event halls.');

        const eventHalls = [
            {
                name: 'Grand Sapphire Ballroom',
                description: 'An opulent 800-seat ballroom featuring crystal chandeliers, a grand marble foyer, and a private bridal suite. The Sapphire Ballroom has hosted some of Colombo\'s most prestigious weddings and galas. Full catering kitchen on-site with a dedicated events coordinator.',
                location: 'Colombo 03, Sri Lanka',
                capacity: { min: 100, max: 800 },
                facilities: ['Air Conditioning', 'Sound System', 'Stage & Lighting', 'Bridal Suite', 'Catering Kitchen', 'Valet Parking', 'LED Wall Display', 'Wheelchair Access'],
                images: [
                    'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&h=600&fit=crop'
                ],
                pricePerHour: 45000,
                pricePerDay: 320000,
                eventTypes: ['Wedding', 'Gala', 'Corporate', 'Exhibition', 'Conference'],
                status: 'active'
            },
            {
                name: 'Lakeside Pavilion',
                description: 'A stunning open-air pavilion overlooking the Beira Lake, offering a magical setting for evening receptions. Features retractable glass panels, ambient lighting, and a wraparound terrace. Perfect for cocktail parties and intimate celebrations under the stars.',
                location: 'Beira Lake, Colombo 02, Sri Lanka',
                capacity: { min: 50, max: 300 },
                facilities: ['Waterfront Views', 'Outdoor Terrace', 'Sound System', 'Bar Area', 'Ambient Lighting', 'Rain Cover', 'Parking'],
                images: [
                    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&h=600&fit=crop'
                ],
                pricePerHour: 28000,
                pricePerDay: 180000,
                eventTypes: ['Wedding', 'Birthday', 'Engagement', 'Corporate', 'Cocktail'],
                status: 'active'
            },
            {
                name: 'The Heritage Hall',
                description: 'Housed in a beautifully restored colonial-era building, The Heritage Hall blends old-world charm with modern amenities. Features teak wood flooring, archway ceilings, and a courtyard garden. Ideal for intimate weddings, literary events, and cultural gatherings.',
                location: 'Galle Fort, Galle, Sri Lanka',
                capacity: { min: 30, max: 200 },
                facilities: ['Heritage Architecture', 'Courtyard Garden', 'Air Conditioning', 'Sound System', 'Wi-Fi', 'Catering Setup', 'Photography Backdrop'],
                images: [
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop'
                ],
                pricePerHour: 22000,
                pricePerDay: 150000,
                eventTypes: ['Wedding', 'Cultural', 'Seminar', 'Birthday', 'Other'],
                status: 'active'
            },
            {
                name: 'Summit Conference Centre',
                description: 'A state-of-the-art conference facility with tiered seating for 500, a fully equipped AV suite, simultaneous translation booths, and breakout rooms. Designed for large-scale corporate events, product launches, and international summits.',
                location: 'Rajagiriya, Colombo, Sri Lanka',
                capacity: { min: 50, max: 500 },
                facilities: ['Tiered Seating', 'AV Equipment', 'Translation Booths', 'Breakout Rooms', 'Green Room', 'High-Speed Wi-Fi', 'Video Conferencing', 'Lobby Café', 'Parking'],
                images: [
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1587825140708-dfaf18c9c2bf?w=800&h=600&fit=crop'
                ],
                pricePerHour: 55000,
                pricePerDay: 400000,
                eventTypes: ['Conference', 'Corporate', 'Seminar', 'Exhibition', 'Product Launch'],
                status: 'active'
            },
            {
                name: 'Royal Kandy Banquet Hall',
                description: 'Nestled in the hills of Kandy with panoramic views of the surrounding mountains. This elegant banquet hall features floor-to-ceiling windows, a private entrance, and traditional Kandyan decor accents. A top choice for destination weddings and milestone celebrations.',
                location: 'Hantana Road, Kandy, Sri Lanka',
                capacity: { min: 80, max: 450 },
                facilities: ['Mountain Views', 'Air Conditioning', 'Dance Floor', 'Stage', 'Sound & DJ Setup', 'Bridal Room', 'Outdoor Garden', 'Free Parking'],
                images: [
                    'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop'
                ],
                pricePerHour: 35000,
                pricePerDay: 250000,
                eventTypes: ['Wedding', 'Birthday', 'Corporate', 'Engagement', 'Gala'],
                status: 'active'
            },
            {
                name: 'Ocean Breeze Events Deck',
                description: 'A premium beachfront event space with an open-air deck directly overlooking the Indian Ocean. Includes cabana-style seating, a sunset bar, and a built-in firepit lounge. Unmatched ambiance for beach weddings, sundowner parties, and coastal celebrations.',
                location: 'Unawatuna Beach, Galle, Sri Lanka',
                capacity: { min: 40, max: 250 },
                facilities: ['Beachfront', 'Sunset Bar', 'Fire Pit Lounge', 'Cabana Seating', 'Sound System', 'BBQ Station', 'Fairy Light Canopy', 'Parking'],
                images: [
                    'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&h=600&fit=crop'
                ],
                pricePerHour: 32000,
                pricePerDay: 220000,
                eventTypes: ['Wedding', 'Birthday', 'Cocktail', 'Engagement', 'Other'],
                status: 'active'
            },
            {
                name: 'Elysium Garden Hall',
                description: 'A lush garden venue enclosed with glass walls, bringing the outdoors in. Features a fountain courtyard, manicured lawns, and a retractable roof section. Suitable for elegant garden parties, fashion shows, and outdoor-style receptions in any weather.',
                location: 'Nugegoda, Colombo, Sri Lanka',
                capacity: { min: 60, max: 350 },
                facilities: ['Glass Enclosure', 'Fountain Courtyard', 'Retractable Roof', 'Garden Lawn', 'Air Conditioning', 'Ambient Lighting', 'Catering Area', 'Bridal Suite'],
                images: [
                    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=800&h=600&fit=crop'
                ],
                pricePerHour: 30000,
                pricePerDay: 200000,
                eventTypes: ['Wedding', 'Exhibition', 'Fashion Show', 'Birthday', 'Corporate'],
                status: 'active'
            },
            {
                name: 'TechHub Innovation Arena',
                description: 'A modern, minimalist event space designed for tech meetups, hackathons, product demos, and startup pitches. Equipped with high-speed fiber internet, 4K projection screens, power charging stations everywhere, and a connected co-working lounge.',
                location: 'Trace Expert City, Colombo 10, Sri Lanka',
                capacity: { min: 20, max: 180 },
                facilities: ['4K Projectors', 'Fiber Internet', 'Charging Stations', 'Whiteboard Walls', 'Co-Working Lounge', 'Podcast Studio', 'Coffee Bar', 'Standing Desks'],
                images: [
                    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop'
                ],
                pricePerHour: 18000,
                pricePerDay: 120000,
                eventTypes: ['Conference', 'Seminar', 'Corporate', 'Workshop', 'Exhibition'],
                status: 'active'
            },
            {
                name: 'Cloud Nine Rooftop Lounge',
                description: 'A stylish rooftop event space on the 25th floor with 360° city views. Features an infinity pool backdrop, mood-lit lounge pods, a premium cocktail bar, and a retractable awning. The most exclusive venue in Colombo for private parties and celebrations.',
                location: '25th Floor, Colombo 01, Sri Lanka',
                capacity: { min: 30, max: 150 },
                facilities: ['360° City Views', 'Infinity Pool Backdrop', 'Cocktail Bar', 'Lounge Pods', 'DJ Booth', 'Retractable Awning', 'Mood Lighting', 'VIP Section'],
                images: [
                    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop'
                ],
                pricePerHour: 40000,
                pricePerDay: 280000,
                eventTypes: ['Birthday', 'Cocktail', 'Corporate', 'Engagement', 'Other'],
                status: 'active'
            },
            {
                name: 'Serenity Tea Garden Hall',
                description: 'Set amidst rolling tea plantations in the hill country, this venue offers a serene escape for destination events. The hall features floor-to-ceiling windows with valley views, a stone fireplace, and a wrap-around verandah. Nearby accommodation available for multi-day events.',
                location: 'Nuwara Eliya, Sri Lanka',
                capacity: { min: 40, max: 220 },
                facilities: ['Tea Plantation Views', 'Stone Fireplace', 'Verandah', 'Air Conditioning', 'Sound System', 'Outdoor Seating', 'Catering Kitchen', 'Nearby Accommodation', 'Free Parking'],
                images: [
                    'https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1515923019249-6b544314450f?w=800&h=600&fit=crop'
                ],
                pricePerHour: 25000,
                pricePerDay: 170000,
                eventTypes: ['Wedding', 'Seminar', 'Corporate', 'Retreat', 'Birthday'],
                status: 'active'
            }
        ];

        const inserted = await EventHall.insertMany(eventHalls);
        console.log(`Successfully inserted ${inserted.length} event halls:`);
        inserted.forEach(h => console.log(`  - ${h.name} (${h.location}) — Rs. ${h.pricePerHour.toLocaleString()}/hr`));

        console.log('\nEVENT HALL SEED COMPLETE');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seedEventHalls();
