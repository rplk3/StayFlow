const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Search hotels
router.get('/search', hotelController.searchHotels);

// Get suggestions
router.get('/suggestions', hotelController.getSuggestions);

// Get hotel details and rooms
router.get('/:id', hotelController.getHotelDetails);

module.exports = router;
