const Transport = require('../models/Transport');

// Vehicle pricing per km (LKR)
const VEHICLE_RATES = {
    sedan: 35,
    suv: 50,
    van: 65,
    luxury: 100
};

const BASE_FARE = {
    sedan: 500,
    suv: 800,
    van: 1000,
    luxury: 2000
};

// Haversine formula for distance between two GPS points
function calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// @desc    Estimate transport cost
// @route   POST /api/transport/estimate
exports.estimateCost = async (req, res) => {
    try {
        const { pickupCoords, dropoffCoords, vehicleType } = req.body;

        if (!pickupCoords || !dropoffCoords || !vehicleType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const distance = calcDistance(
            pickupCoords.lat, pickupCoords.lng,
            dropoffCoords.lat, dropoffCoords.lng
        );

        // Apply a road factor (roads are ~1.4x the straight-line distance)
        const roadDistance = Math.round(distance * 1.4 * 10) / 10;
        const baseFare = BASE_FARE[vehicleType] || 500;
        const perKmRate = VEHICLE_RATES[vehicleType] || 35;
        const cost = Math.round(baseFare + (roadDistance * perKmRate));

        res.json({
            estimatedDistance: roadDistance,
            estimatedCost: cost,
            baseFare,
            perKmRate,
            vehicleType
        });
    } catch (err) {
        console.error('Estimate Cost Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Create a transport request
// @route   POST /api/transport
exports.createTransport = async (req, res) => {
    try {
        const transport = await Transport.create(req.body);
        res.status(201).json(transport);
    } catch (err) {
        console.error('Create Transport Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get transport by booking ID
// @route   GET /api/transport/booking/:bookingId
exports.getTransportByBooking = async (req, res) => {
    try {
        const transport = await Transport.findOne({ bookingId: req.params.bookingId });
        if (!transport) return res.status(404).json({ message: 'No transport found for this booking' });
        res.json(transport);
    } catch (err) {
        console.error('Get Transport Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Update transport status
// @route   PUT /api/transport/:id/status
exports.updateTransportStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const transport = await Transport.findById(req.params.id);
        if (!transport) return res.status(404).json({ message: 'Transport not found' });

        transport.status = status;
        await transport.save();
        res.json(transport);
    } catch (err) {
        console.error('Update Transport Status Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Get all transport requests (admin)
// @route   GET /api/transport
exports.getAllTransports = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = {};
        if (status) query.status = status;

        const total = await Transport.countDocuments(query);
        const transports = await Transport.find(query)
            .populate('bookingId')
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.json({ transports, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        console.error('Get All Transports Error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
