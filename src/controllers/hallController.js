const Hall = require('../models/Hall');
const EventBooking = require('../models/EventBooking');
const { checkAvailability } = require('../services/availabilityService');

// GET /api/halls - List halls with filters
exports.getHalls = async (req, res) => {
    try {
        const { capacityMin, capacityMax, facility, date, active } = req.query;
        const filter = {};

        if (active !== undefined) filter.isActive = active === 'true';
        else filter.isActive = true;

        if (capacityMin) filter.capacity = { ...filter.capacity, $gte: Number(capacityMin) };
        if (capacityMax) filter.capacity = { ...filter.capacity, $lte: Number(capacityMax) };
        if (facility) {
            const facilities = facility.split(',').map(f => f.trim());
            filter.facilities = { $all: facilities };
        }

        const halls = await Hall.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: halls });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/halls/:id - Get hall details
exports.getHallById = async (req, res) => {
    try {
        const hall = await Hall.findById(req.params.id);
        if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });
        res.json({ success: true, data: hall });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/halls - Create hall (admin)
exports.createHall = async (req, res) => {
    try {
        const hall = await Hall.create(req.body);
        res.status(201).json({ success: true, data: hall });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// PUT /api/halls/:id - Update hall (admin)
exports.updateHall = async (req, res) => {
    try {
        const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });
        res.json({ success: true, data: hall });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// DELETE /api/halls/:id - Delete hall (admin, with rule checks)
exports.deleteHall = async (req, res) => {
    try {
        const hall = await Hall.findById(req.params.id);
        if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });

        // Check for future approved bookings
        const futureBookings = await EventBooking.countDocuments({
            hallId: hall._id,
            status: 'APPROVED',
            eventDate: { $gte: new Date() }
        });

        if (futureBookings > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete hall: ${futureBookings} future approved booking(s) exist`
            });
        }

        await Hall.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Hall deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/halls/:id/check-availability
exports.checkHallAvailability = async (req, res) => {
    try {
        const { eventDate, startTime, endTime } = req.body;
        if (!eventDate || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: 'eventDate, startTime, and endTime are required' });
        }

        const result = await checkAvailability(req.params.id, eventDate, startTime, endTime);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
