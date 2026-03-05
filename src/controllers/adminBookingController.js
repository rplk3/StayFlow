const EventBooking = require('../models/EventBooking');
const { checkAvailability } = require('../services/availabilityService');

// GET /api/admin/event-bookings - List all bookings with filters
exports.getAllBookings = async (req, res) => {
    try {
        const { status, dateFrom, dateTo, hallId } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (hallId) filter.hallId = hallId;
        if (dateFrom || dateTo) {
            filter.eventDate = {};
            if (dateFrom) filter.eventDate.$gte = new Date(dateFrom);
            if (dateTo) filter.eventDate.$lte = new Date(dateTo);
        }

        const bookings = await EventBooking.find(filter)
            .populate('hallId', 'name images')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bookings, count: bookings.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/admin/event-bookings/:id/approve
exports.approveBooking = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (booking.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: `Can only approve PENDING bookings. Current: ${booking.status}` });
        }

        // Re-check availability before approving (exclude this booking from conflicts)
        const availability = await checkAvailability(
            booking.hallId, booking.eventDate, booking.startTime, booking.endTime, booking._id
        );

        // Only consider APPROVED conflicts (allow multiple pending, but prevent double-approved)
        const approvedConflicts = availability.conflicts.filter(c => c.status === 'APPROVED');
        if (approvedConflicts.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Cannot approve: overlapping APPROVED booking exists',
                conflicts: approvedConflicts
            });
        }

        const { adminId, adminNotes, finalTotal } = req.body;

        booking.status = 'APPROVED';
        booking.adminDecision = {
            decidedBy: adminId || 'admin',
            decidedAt: new Date(),
            adminNotes: adminNotes || '',
            finalTotal: finalTotal || booking.pricing.total
        };

        await booking.save();

        console.log(`[EMAIL-SIM] Booking APPROVED email sent to ${booking.customerEmail} for ref ${booking.bookingRef}`);

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/admin/event-bookings/:id/reject
exports.rejectBooking = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (booking.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: `Can only reject PENDING bookings. Current: ${booking.status}` });
        }

        const { adminId, reason, adminNotes } = req.body;
        if (!reason) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        }

        booking.status = 'REJECTED';
        booking.adminDecision = {
            decidedBy: adminId || 'admin',
            decidedAt: new Date(),
            reason,
            adminNotes: adminNotes || ''
        };

        await booking.save();

        console.log(`[EMAIL-SIM] Booking REJECTED email sent to ${booking.customerEmail} for ref ${booking.bookingRef}`);

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PATCH /api/admin/event-bookings/:id/cancel - Admin cancel
exports.adminCancelBooking = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (['REJECTED', 'CANCELLED'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: `Cannot cancel booking with status ${booking.status}` });
        }

        const { adminId, reason } = req.body;
        booking.status = 'CANCELLED';
        booking.adminDecision = {
            ...booking.adminDecision?.toObject?.() || {},
            decidedBy: adminId || 'admin',
            decidedAt: new Date(),
            reason: reason || 'Cancelled by admin'
        };

        await booking.save();

        console.log(`[EMAIL-SIM] Booking CANCELLED by admin - email sent to ${booking.customerEmail} for ref ${booking.bookingRef}`);

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/admin/event-bookings/stats
exports.getBookingStats = async (req, res) => {
    try {
        const { from, to } = req.query;
        const dateFilter = {};
        if (from) dateFilter.$gte = new Date(from);
        if (to) dateFilter.$lte = new Date(to);

        const matchStage = {};
        if (from || to) matchStage.eventDate = dateFilter;

        const statusCounts = await EventBooking.aggregate([
            { $match: matchStage },
            { $group: { _id: '$status', count: { $sum: 1 }, totalRevenue: { $sum: '$pricing.total' } } }
        ]);

        const topHalls = await EventBooking.aggregate([
            { $match: { ...matchStage, status: 'APPROVED' } },
            { $group: { _id: '$hallSnapshot.name', bookings: { $sum: 1 }, revenue: { $sum: '$pricing.total' } } },
            { $sort: { bookings: -1 } },
            { $limit: 5 }
        ]);

        const totalApprovedRevenue = statusCounts
            .filter(s => s._id === 'APPROVED')
            .reduce((sum, s) => sum + s.totalRevenue, 0);

        res.json({
            success: true,
            data: {
                statusCounts: statusCounts.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
                totalApprovedRevenue: Math.round(totalApprovedRevenue * 100) / 100,
                topHalls
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
