const EventBooking = require('../models/EventBooking');
const Hall = require('../models/Hall');
const { checkAvailability } = require('../services/availabilityService');
const { calculatePricing, calculateDuration } = require('../services/pricingService');

/**
 * Generate unique booking reference: EVT-YYYY-NNNN
 */
async function generateBookingRef() {
    const year = new Date().getFullYear();
    const count = await EventBooking.countDocuments();
    const num = String(count + 1).padStart(4, '0');
    return `EVT-${year}-${num}`;
}

// POST /api/event-bookings - Create booking
exports.createBooking = async (req, res) => {
    try {
        const { hallId, eventDate, startTime, endTime, guestsCount, services, ...rest } = req.body;

        // Get hall
        const hall = await Hall.findById(hallId);
        if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });
        if (!hall.isActive) return res.status(400).json({ success: false, message: 'Hall is not active' });

        // Validate guests
        if (guestsCount > hall.capacity) {
            return res.status(400).json({
                success: false,
                message: `Guest count (${guestsCount}) exceeds hall capacity (${hall.capacity})`
            });
        }

        // Check availability
        const availability = await checkAvailability(hallId, eventDate, startTime, endTime);
        if (!availability.available) {
            return res.status(409).json({
                success: false,
                message: 'Time slot not available',
                conflicts: availability.conflicts
            });
        }

        // Calculate pricing
        const svc = services || {};
        const pricingResult = calculatePricing(hall, startTime, endTime, svc, guestsCount);

        // Create booking
        const bookingRef = await generateBookingRef();
        const booking = await EventBooking.create({
            ...rest,
            hallId,
            eventDate,
            startTime,
            endTime,
            guestsCount,
            services: svc,
            bookingRef,
            durationHours: pricingResult.durationHours,
            hallSnapshot: {
                name: hall.name,
                capacity: hall.capacity,
                priceModel: hall.priceModel,
                pricePerHour: hall.pricePerHour,
                fixedPrice: hall.fixedPrice
            },
            pricing: {
                hallCost: pricingResult.hallCost,
                servicesCost: pricingResult.servicesCost,
                subtotal: pricingResult.subtotal,
                tax: pricingResult.tax,
                total: pricingResult.total
            },
            status: 'PENDING'
        });

        console.log(`[EMAIL-SIM] Booking confirmation sent to ${booking.customerEmail} for ref ${booking.bookingRef}`);

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET /api/event-bookings/me - Get my bookings
exports.getMyBookings = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

        const bookings = await EventBooking.find({ userId }).populate('hallId', 'name images').sort({ createdAt: -1 });
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/event-bookings/:id - Get booking details
exports.getBookingById = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id).populate('hallId');
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/event-bookings/:id - Update booking (owner only)
exports.updateBooking = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        // Only PENDING bookings can be fully edited; APPROVED allows limited edits
        if (!['PENDING', 'APPROVED'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: `Cannot edit booking with status ${booking.status}` });
        }

        const { hallId, eventDate, startTime, endTime, guestsCount, services, ...rest } = req.body;
        const useHallId = hallId || booking.hallId;
        const useDate = eventDate || booking.eventDate;
        const useStart = startTime || booking.startTime;
        const useEnd = endTime || booking.endTime;
        const useGuests = guestsCount || booking.guestsCount;
        const useSvc = services || booking.services;

        // Get hall for validation
        const hall = await Hall.findById(useHallId);
        if (!hall) return res.status(404).json({ success: false, message: 'Hall not found' });

        if (useGuests > hall.capacity) {
            return res.status(400).json({
                success: false,
                message: `Guest count (${useGuests}) exceeds hall capacity (${hall.capacity})`
            });
        }

        // Re-check availability if time/date changed (exclude current booking)
        const dateChanged = eventDate && new Date(eventDate).toISOString() !== new Date(booking.eventDate).toISOString();
        const timeChanged = (startTime && startTime !== booking.startTime) || (endTime && endTime !== booking.endTime);

        if (dateChanged || timeChanged) {
            const availability = await checkAvailability(useHallId, useDate, useStart, useEnd, booking._id);
            if (!availability.available) {
                return res.status(409).json({
                    success: false,
                    message: 'Updated time slot not available',
                    conflicts: availability.conflicts
                });
            }
        }

        // Recalculate pricing
        const pricingResult = calculatePricing(hall, useStart, useEnd, useSvc, useGuests);

        // If approved booking changes date/time, revert to pending
        let newStatus = booking.status;
        if (booking.status === 'APPROVED' && (dateChanged || timeChanged)) {
            newStatus = 'PENDING';
        }

        const updated = await EventBooking.findByIdAndUpdate(req.params.id, {
            ...rest,
            hallId: useHallId,
            eventDate: useDate,
            startTime: useStart,
            endTime: useEnd,
            guestsCount: useGuests,
            services: useSvc,
            durationHours: pricingResult.durationHours,
            status: newStatus,
            hallSnapshot: {
                name: hall.name,
                capacity: hall.capacity,
                priceModel: hall.priceModel,
                pricePerHour: hall.pricePerHour,
                fixedPrice: hall.fixedPrice
            },
            pricing: {
                hallCost: pricingResult.hallCost,
                servicesCost: pricingResult.servicesCost,
                subtotal: pricingResult.subtotal,
                tax: pricingResult.tax,
                total: pricingResult.total
            }
        }, { new: true, runValidators: true });

        res.json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// PATCH /api/event-bookings/:id/cancel - Cancel booking (owner)
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await EventBooking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (!['PENDING', 'APPROVED'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: `Cannot cancel booking with status ${booking.status}` });
        }

        booking.status = 'CANCELLED';
        await booking.save();

        console.log(`[EMAIL-SIM] Cancellation confirmation sent to ${booking.customerEmail} for ref ${booking.bookingRef}`);

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
