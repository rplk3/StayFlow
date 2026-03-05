import express from 'express';
import jwt from 'jsonwebtoken';
import Guest from '../models/Guest.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'guestgo_secret_key', {
        expiresIn: '30d',
    });
};

// Register guest
router.post('/register', async (req, res) => {
    const { name, email, password, phone, roomNumber } = req.body;

    try {
        const userExists = await Guest.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const guest = await Guest.create({ name, email, password, phone, roomNumber });

        if (guest) {
            res.status(201).json({
                _id: guest._id,
                name: guest.name,
                email: guest.email,
                phone: guest.phone,
                roomNumber: guest.roomNumber,
                token: generateToken(guest._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid guest data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login guest
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const guest = await Guest.findOne({ email });

        if (guest && (await guest.matchPassword(password))) {
            res.json({
                _id: guest._id,
                name: guest.name,
                email: guest.email,
                phone: guest.phone,
                roomNumber: guest.roomNumber,
                token: generateToken(guest._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get current guest profile (protected)
router.get('/profile', protect, async (req, res) => {
    res.json(req.guest);
});

export default router;
