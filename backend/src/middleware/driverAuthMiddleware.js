const jwt = require('jsonwebtoken');
const Driver = require('../modules/driver/models/Driver');

const protectDriver = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Use the same secret used during driver login
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

            req.driver = await Driver.findById(decoded.id).select('-password');

            if (!req.driver) {
                return res.status(401).json({ message: 'Not authorized, driver not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protectDriver };
