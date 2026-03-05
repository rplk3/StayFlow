const EventBooking = require('../models/EventBooking');
const HallBlock = require('../models/HallBlock');

/**
 * Convert "HH:MM" to minutes since midnight
 */
function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

/**
 * Check if two time ranges overlap on the same date.
 * Overlap rule: (existing.start < requested.end) AND (requested.start < existing.end)
 */
function timesOverlap(existStart, existEnd, reqStart, reqEnd) {
    const es = timeToMinutes(existStart);
    const ee = timeToMinutes(existEnd);
    const rs = timeToMinutes(reqStart);
    const re = timeToMinutes(reqEnd);
    return (es < re) && (rs < ee);
}

/**
 * Check availability for a hall on a given date/time range.
 * Returns { available: boolean, conflicts: [] }
 * Considers APPROVED and PENDING bookings (strict mode).
 * Optionally excludes a specific booking (for edits).
 */
async function checkAvailability(hallId, eventDate, startTime, endTime, excludeBookingId = null) {
    const dateStr = new Date(eventDate).toISOString().split('T')[0];
    const dayStart = new Date(dateStr + 'T00:00:00.000Z');
    const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

    // Find existing bookings for this hall on this date that are APPROVED or PENDING
    const query = {
        hallId,
        eventDate: { $gte: dayStart, $lte: dayEnd },
        status: { $in: ['APPROVED', 'PENDING'] }
    };
    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const existingBookings = await EventBooking.find(query).lean();

    const conflicts = [];
    for (const booking of existingBookings) {
        if (timesOverlap(booking.startTime, booking.endTime, startTime, endTime)) {
            conflicts.push({
                bookingRef: booking.bookingRef,
                startTime: booking.startTime,
                endTime: booking.endTime,
                status: booking.status
            });
        }
    }

    // Also check HallBlocks
    const blocks = await HallBlock.find({
        hallId,
        date: { $gte: dayStart, $lte: dayEnd }
    }).lean();

    for (const block of blocks) {
        if (timesOverlap(block.startTime, block.endTime, startTime, endTime)) {
            conflicts.push({
                type: 'BLOCK',
                reason: block.reason,
                startTime: block.startTime,
                endTime: block.endTime
            });
        }
    }

    return {
        available: conflicts.length === 0,
        conflicts
    };
}

module.exports = { checkAvailability, timeToMinutes, timesOverlap };
