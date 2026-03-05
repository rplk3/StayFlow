const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().limit(10);
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching test bookings' });
    }
});

module.exports = router;
