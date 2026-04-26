const Transport = require('../models/Transport');
const Booking = require('../../hotelRoom/models/Booking');

// Vehicle pricing per km (LKR)
const VEHICLE_RATES = { sedan: 35, suv: 50, van: 65, luxury: 100 };
const BASE_FARE = { sedan: 500, suv: 800, van: 1000, luxury: 2000 };

// Haversine formula
function calcDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ==================== PUBLIC ====================

// POST /api/transport/estimate
exports.estimateCost = async (req, res) => {
    try {
        const { pickupCoords, dropoffCoords, vehicleType } = req.body;
        if (!pickupCoords || !dropoffCoords || !vehicleType) return res.status(400).json({ message: 'Missing required fields' });

        const roadDistance = Math.round(calcDistance(pickupCoords.lat, pickupCoords.lng, dropoffCoords.lat, dropoffCoords.lng) * 1.4 * 10) / 10;
        const baseFare = BASE_FARE[vehicleType] || 500;
        const perKmRate = VEHICLE_RATES[vehicleType] || 35;

        res.json({ estimatedDistance: roadDistance, estimatedCost: Math.round(baseFare + roadDistance * perKmRate), baseFare, perKmRate, vehicleType });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/transport
exports.createTransport = async (req, res) => {
    try {
        const transport = await Transport.create(req.body);
        res.status(201).json(transport);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/transport/booking/:bookingId
exports.getTransportByBooking = async (req, res) => {
    try {
        const transport = await Transport.findOne({ bookingId: req.params.bookingId });
        if (!transport) return res.status(404).json({ message: 'No transport found' });
        res.json(transport);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/transport/user/:userId — get all transport for a user's bookings
exports.getUserTransports = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.params.userId }).select('_id');
        const bookingIds = bookings.map(b => b._id);
        const transports = await Transport.find({ bookingId: { $in: bookingIds } })
            .populate({ path: 'bookingId', populate: { path: 'hotelId', select: 'name destination' } })
            .sort({ createdAt: -1 });
        res.json(transports);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ==================== ADMIN ====================

// GET /api/transport — list all with filters
exports.getAllTransports = async (req, res) => {
    try {
        const { status, vehicleType, search, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
        let query = {};

        if (status) query.status = status;
        if (vehicleType) query.vehicleType = vehicleType;
        if (dateFrom || dateTo) {
            query.pickupDate = {};
            if (dateFrom) query.pickupDate.$gte = new Date(dateFrom);
            if (dateTo) query.pickupDate.$lte = new Date(dateTo);
        }
        if (search) {
            query.$or = [
                { pickupAddress: { $regex: search, $options: 'i' } },
                { dropoffAddress: { $regex: search, $options: 'i' } },
                { 'forwardedToCompany.companyName': { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Transport.countDocuments(query);
        const transports = await Transport.find(query)
            .populate({ path: 'bookingId', populate: [{ path: 'hotelId', select: 'name destination' }, { path: 'roomId', select: 'roomType roomNumber' }] })
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.json({ transports, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/transport/:id — single transport with booking details
exports.getTransportById = async (req, res) => {
    try {
        const transport = await Transport.findById(req.params.id)
            .populate({ path: 'bookingId', populate: [{ path: 'hotelId', select: 'name destination address city' }, { path: 'roomId', select: 'roomType roomNumber basePrice' }] });
        if (!transport) return res.status(404).json({ message: 'Transport not found' });
        res.json(transport);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/transport/:id/approve
exports.approveTransport = async (req, res) => {
    try {
        const transport = await Transport.findById(req.params.id).populate('bookingId');
        if (!transport) return res.status(404).json({ message: 'Transport not found' });

        // Check if booking is valid
        if (transport.bookingId && ['CANCELLED', 'NO_SHOW'].includes(transport.bookingId.status)) {
            return res.status(400).json({ message: 'Cannot approve: linked booking is ' + transport.bookingId.status });
        }

        transport.status = 'confirmed';
        transport.approvedBy = req.body.approvedBy || 'Admin';
        transport.approvedAt = new Date();
        transport.adminNotes = req.body.adminNotes || transport.adminNotes;
        await transport.save();
        res.json({ message: 'Transport approved', transport });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/transport/:id/reject
exports.rejectTransport = async (req, res) => {
    try {
        const transport = await Transport.findById(req.params.id);
        if (!transport) return res.status(404).json({ message: 'Transport not found' });

        transport.status = 'rejected';
        transport.rejectionReason = req.body.rejectionReason || 'No reason provided';
        transport.adminNotes = req.body.adminNotes || transport.adminNotes;
        await transport.save();
        res.json({ message: 'Transport rejected', transport });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/transport/:id/cancel
exports.cancelTransport = async (req, res) => {
    try {
        const transport = await Transport.findById(req.params.id);
        if (!transport) return res.status(404).json({ message: 'Transport not found' });

        transport.status = 'cancelled';
        transport.adminNotes = req.body.adminNotes || transport.adminNotes;
        await transport.save();
        res.json({ message: 'Transport cancelled', transport });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/transport/:id/complete
exports.completeTransport = async (req, res) => {
    try {
        const transport = await Transport.findById(req.params.id);
        if (!transport) return res.status(404).json({ message: 'Transport not found' });

        transport.status = 'completed';
        transport.adminNotes = req.body.adminNotes || transport.adminNotes;
        await transport.save();
        res.json({ message: 'Transport completed', transport });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/transport/:id/assign
exports.assignTransport = async (req, res) => {
    try {
        const { driverName, vehiclePlate } = req.body;
        if (!driverName || !vehiclePlate) return res.status(400).json({ message: 'Driver and Vehicle are required' });

        const transport = await Transport.findById(req.params.id);
        if (!transport) return res.status(404).json({ message: 'Transport not found' });

        transport.assignedDriver = driverName;
        transport.assignedVehicle = vehiclePlate;
        transport.status = 'confirmed'; // Automatically confirm on assignment
        await transport.save();
        res.json({ message: 'Transport assigned successfully', transport });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/transport/:id/forward — forward to external transport company
exports.forwardToCompany = async (req, res) => {
    try {
        const { companyName, reference, notes } = req.body;
        if (!companyName) return res.status(400).json({ message: 'Company name is required' });

        const transport = await Transport.findById(req.params.id);
        if (!transport) return res.status(404).json({ message: 'Transport not found' });

        transport.forwardedToCompany = { companyName, reference: reference || '', notes: notes || '', forwardedAt: new Date() };
        transport.adminNotes = req.body.adminNotes || transport.adminNotes;
        await transport.save();
        res.json({ message: `Forwarded to ${companyName}`, transport });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/transport/:id — general edit
exports.updateTransport = async (req, res) => {
    try {
        const transport = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate({ path: 'bookingId', populate: { path: 'hotelId', select: 'name destination' } });
        if (!transport) return res.status(404).json({ message: 'Transport not found' });
        res.json(transport);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// DELETE /api/transport/:id
exports.deleteTransport = async (req, res) => {
    try {
        const transport = await Transport.findByIdAndDelete(req.params.id);
        if (!transport) return res.status(404).json({ message: 'Transport not found' });
        res.json({ message: 'Transport deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
