const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const RatePlan = require('../models/RatePlan');

// Step 1, 2: Search hotels
exports.searchHotels = async (req, res) => {
    try {
        const { destination, checkIn, checkOut, guests } = req.query;

        // Base query for hotel
        let query = {};
        if (destination) {
            query.destination = { $regex: new RegExp(destination, 'i') };
        }

        const hotels = await Hotel.find(query);

        if (!hotels.length) {
            return res.json([]);
        }

        res.json(hotels);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during hotel search' });
    }
};

// Step 4: System shows room types and rate plans
exports.getHotelDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const hotel = await Hotel.findById(id);
        if (!hotel) return res.status(404).json({ error: 'Hotel not found' });

        const rooms = await Room.find({ hotelId: id });
        const ratePlans = await RatePlan.find({ hotelId: id });

        res.json({
            hotel,
            rooms,
            ratePlans
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching hotel details' });
    }
};

// Get destination suggestions
exports.getSuggestions = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);
        
        const destinations = await Hotel.distinct('destination', {
            destination: { $regex: new RegExp(`^${query}`, 'i') }
        });
        
        res.json(destinations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching suggestions' });
    }
};
