import jwt from 'jsonwebtoken';
import Guest from '../models/Guest.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorised – no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'guestgo_secret_key');
        req.guest = await Guest.findById(decoded.id).select('-password');
        if (!req.guest) return res.status(401).json({ message: 'Guest not found' });
        next();
    } catch {
        return res.status(401).json({ message: 'Token invalid or expired' });
    }
};
