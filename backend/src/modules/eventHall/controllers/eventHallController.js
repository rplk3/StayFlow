const EventHall = require('../models/EventHall');
const EventBooking = require('../models/EventBooking');

// ==================== PUBLIC: HALLS ====================

// GET /api/event-halls — list active halls
exports.listHalls = async (req, res) => {
    try {
        const { search, eventType, minCapacity } = req.query;
        let query = { status: 'active' };
        if (search) query.name = { $regex: search, $options: 'i' };
        if (eventType) query.eventTypes = eventType;
        if (minCapacity) query['capacity.max'] = { $gte: parseInt(minCapacity) };

        const halls = await EventHall.find(query).sort({ createdAt: -1 });
        res.json(halls);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/event-halls/:id
exports.getHallById = async (req, res) => {
    try {
        const hall = await EventHall.findById(req.params.id);
        if (!hall) return res.status(404).json({ message: 'Hall not found' });
        res.json(hall);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/event-halls/check-availability
exports.checkAvailability = async (req, res) => {
    try {
        const { hallId, eventDate, startTime, endTime } = req.body;
        if (!hallId || !eventDate || !startTime || !endTime) {
            return res.status(400).json({ message: 'hallId, eventDate, startTime, endTime required' });
        }

        const date = new Date(eventDate);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        // Find overlapping bookings on the same date that aren't cancelled/rejected
        const conflicts = await EventBooking.find({
            hallId,
            eventDate: { $gte: dayStart, $lte: dayEnd },
            status: { $nin: ['CANCELLED', 'REJECTED'] },
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });

        res.json({ available: conflicts.length === 0, conflicts: conflicts.length });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/event-halls/quote — calculate pricing
exports.getQuote = async (req, res) => {
    try {
        const { hallId, startTime, endTime } = req.body;
        const hall = await EventHall.findById(hallId);
        if (!hall) return res.status(404).json({ message: 'Hall not found' });

        // Calculate duration in hours
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        let durationHours = (eh + em / 60) - (sh + sm / 60);
        if (durationHours <= 0) durationHours += 24;
        durationHours = Math.round(durationHours * 10) / 10;

        // Use per-day rate if >= 8 hours
        let hallCharge;
        if (durationHours >= 8 && hall.pricePerDay) {
            hallCharge = hall.pricePerDay;
        } else {
            hallCharge = Math.round(hall.pricePerHour * durationHours);
        }

        const taxesFees = Math.round(hallCharge * 0.12);
        const totalAmount = hallCharge + taxesFees;

        res.json({
            hallCharge,
            taxesFees,
            totalAmount,
            dueNow: totalAmount,
            dueAtVenue: 0,
            durationHours
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ==================== PUBLIC: BOOKINGS (checkout flow) ====================

// POST /api/event-halls/bookings/hold — Step 1: create hold
exports.createHold = async (req, res) => {
    try {
        const { hallId, userId, guestDetails, eventType, eventDate, startTime, endTime, guestCount, specialNotes, pricing } = req.body;

        // Re-check availability
        const date = new Date(eventDate);
        const dayStart = new Date(new Date(date).setHours(0, 0, 0, 0));
        const dayEnd = new Date(new Date(date).setHours(23, 59, 59, 999));
        const conflicts = await EventBooking.find({
            hallId,
            eventDate: { $gte: dayStart, $lte: dayEnd },
            status: { $nin: ['CANCELLED', 'REJECTED'] },
            $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }]
        });
        if (conflicts.length > 0) return res.status(400).json({ message: 'This time slot is no longer available' });

        // Duration
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        let durationHours = (eh + em / 60) - (sh + sm / 60);
        if (durationHours <= 0) durationHours += 24;

        const bookingCode = 'EH' + Math.random().toString(36).substr(2, 6).toUpperCase();

        const booking = await EventBooking.create({
            hallId, userId, guestDetails, eventType, eventDate, startTime, endTime, durationHours,
            guestCount, specialNotes, pricing, bookingCode, status: 'HOLD', paymentStatus: 'PENDING'
        });

        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create hold', error: err.message });
    }
};

// POST /api/event-halls/bookings/:id/checkout — Step 2: pay & confirm
exports.checkout = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status !== 'HOLD') return res.status(400).json({ message: 'Booking is no longer on hold' });

        const { paymentToken } = req.body;
        if (paymentToken) {
            booking.paymentStatus = 'PAID_IN_FULL';
        }

        booking.status = 'PENDING'; // Awaiting admin approval
        await booking.save();

        console.log(`[EMAIL MOCK] Event Hall booking confirmation sent to ${booking.guestDetails.email} for ${booking.bookingCode}`);
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ message: 'Checkout failed', error: err.message });
    }
};

// GET /api/event-halls/bookings/user/:userId
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await EventBooking.find({ userId: req.params.userId })
            .populate('hallId')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/event-halls/bookings/:id — modify before approval
exports.modifyBooking = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (!['HOLD', 'PENDING'].includes(booking.status)) {
            return res.status(400).json({ message: 'Cannot modify after approval' });
        }

        const allowed = ['eventType', 'eventDate', 'startTime', 'endTime', 'guestCount', 'specialNotes'];
        allowed.forEach(f => { if (req.body[f] !== undefined) booking[f] = req.body[f]; });
        await booking.save();
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Failed to modify', error: err.message });
    }
};

// POST /api/event-halls/bookings/:id/cancel — user cancel
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.status === 'CANCELLED') return res.status(400).json({ message: 'Already cancelled' });

        booking.status = 'CANCELLED';
        booking.cancellationDetails = { cancelledAt: new Date(), reason: req.body.reason || 'User cancelled' };

        if (booking.paymentStatus === 'PAID_IN_FULL') {
            booking.cancellationDetails.refundAmount = booking.pricing.totalAmount;
            booking.paymentStatus = 'REFUNDED';
        }

        await booking.save();
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ message: 'Cancellation failed', error: err.message });
    }
};

// ==================== ADMIN: HALLS ====================

// POST /api/event-halls/admin/halls
exports.createHall = async (req, res) => {
    try {
        const hall = await EventHall.create(req.body);
        res.status(201).json(hall);
    } catch (err) {
        res.status(500).json({ message: 'Failed to create hall', error: err.message });
    }
};

// PUT /api/event-halls/admin/halls/:id
exports.updateHall = async (req, res) => {
    try {
        const hall = await EventHall.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!hall) return res.status(404).json({ message: 'Hall not found' });
        res.json(hall);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update', error: err.message });
    }
};

// DELETE /api/event-halls/admin/halls/:id
exports.deleteHall = async (req, res) => {
    try {
        const hall = await EventHall.findById(req.params.id);
        if (!hall) return res.status(404).json({ message: 'Hall not found' });
        hall.status = 'inactive';
        await hall.save();
        res.json({ message: 'Hall deactivated' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete', error: err.message });
    }
};

// GET /api/event-halls/admin/halls — includes inactive
exports.adminListHalls = async (req, res) => {
    try {
        const halls = await EventHall.find().sort({ createdAt: -1 });
        res.json(halls);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ==================== ADMIN: BOOKINGS ====================

// GET /api/event-halls/admin/bookings
exports.adminListBookings = async (req, res) => {
    try {
        const { status, hallId, search, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
        let query = {};
        if (status) query.status = status;
        if (hallId) query.hallId = hallId;
        if (dateFrom || dateTo) {
            query.eventDate = {};
            if (dateFrom) query.eventDate.$gte = new Date(dateFrom);
            if (dateTo) query.eventDate.$lte = new Date(dateTo);
        }
        if (search) {
            query.$or = [
                { bookingCode: { $regex: search, $options: 'i' } },
                { 'guestDetails.firstName': { $regex: search, $options: 'i' } },
                { 'guestDetails.lastName': { $regex: search, $options: 'i' } },
                { 'guestDetails.email': { $regex: search, $options: 'i' } }
            ];
        }

        const total = await EventBooking.countDocuments(query);
        const bookings = await EventBooking.find(query)
            .populate('hallId')
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        res.json({ bookings, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/event-halls/admin/bookings/:id
exports.adminGetBooking = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id).populate('hallId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/event-halls/admin/bookings/:id/approve
exports.approveBooking = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = 'APPROVED';
        booking.confirmationNote = req.body.confirmationNote || '';
        await booking.save();

        console.log(`[EMAIL MOCK] Event approved! Sending to ${booking.guestDetails.email}`);
        res.json({ message: 'Booking approved', booking });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/event-halls/admin/bookings/:id/reject
exports.rejectBooking = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = 'REJECTED';
        booking.rejectedReason = req.body.rejectedReason || 'No reason provided';

        if (booking.paymentStatus === 'PAID_IN_FULL') {
            booking.paymentStatus = 'REFUNDED';
        }

        await booking.save();
        res.json({ message: 'Booking rejected', booking });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/event-halls/admin/bookings/:id/cancel
exports.adminCancelBooking = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = 'CANCELLED';
        booking.cancellationDetails = { cancelledAt: new Date(), reason: req.body.reason || 'Admin cancelled' };

        if (booking.paymentStatus === 'PAID_IN_FULL') {
            booking.cancellationDetails.refundAmount = booking.pricing.totalAmount;
            booking.paymentStatus = 'REFUNDED';
        }

        await booking.save();
        res.json({ message: 'Booking cancelled', booking });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/event-halls/admin/bookings/:id/complete
exports.completeBooking = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        booking.status = 'COMPLETED';
        await booking.save();
        res.json({ message: 'Booking completed', booking });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
