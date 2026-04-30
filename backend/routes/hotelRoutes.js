const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');

// Get suggestions for destination based on input
router.get('/suggestions', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);
        
        // Find distinct destinations that match the query (case insensitive)
        const destinations = await Hotel.distinct('destination', {
            destination: { $regex: new RegExp(`^${query}`, 'i') }
        });
        
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Search functionality used by frontend SearchResults.jsx
router.get('/search', async (req, res) => {
    try {
        const { destination, checkIn, checkOut, guests } = req.query;
        let query = {};
        
        if (destination) {
            query.destination = { $regex: new RegExp(`^${destination}$`, 'i') };
        }
        
        // In a real app we'd filter by availability (checkIn/checkOut) and capacity (guests)
        
        const hotels = await Hotel.find(query);
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
