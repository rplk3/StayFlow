const Booking = require('../models/Booking');
const Room = require('../models/Room');
const RatePlan = require('../models/RatePlan');
const Coupon = require('../models/Coupon');

// Step 6, 7: Validate inventory, coupon, calculate pricing
exports.validateAndQuote = async (req, res) => {
    try {
        const { hotelId, roomId, ratePlanId, checkInDate, checkOutDate, guests, couponCode } = req.body;

        // 1. Validate inventory
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ error: 'Room not found' });

        const activeBookingsCount = await Booking.countDocuments({
            roomId,
            status: { $in: ['HOLD', 'CONFIRMED'] },
            $or: [
                { checkInDate: { $lt: new Date(checkOutDate) }, checkOutDate: { $gt: new Date(checkInDate) } }
            ]
        });

        if (activeBookingsCount >= room.totalRooms) {
            return res.status(400).json({ error: 'No rooms available for selected dates' });
        }

        // 2. Pricing and Rate Plan
        const ratePlan = await RatePlan.findById(ratePlanId);
        if (!ratePlan) return res.status(404).json({ error: 'Rate plan not found' });

        const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
        if (nights <= 0) return res.status(400).json({ error: 'Invalid dates' });

        let roomTotal = room.basePrice * ratePlan.priceMultiplier * nights;
        
        let discountAmount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
            if (coupon && (!coupon.validUntil || coupon.validUntil > new Date())) {
                discountAmount = roomTotal * (coupon.discountPercentage / 100);
                if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                    discountAmount = coupon.maxDiscountAmount;
                }
            } else {
                return res.status(400).json({ error: 'Invalid or expired coupon' });
            }
        }

        // Taxes/Fees arbitrarily set to 12%
        const taxesFees = (roomTotal - discountAmount) * 0.12;
        const totalAmount = (roomTotal - discountAmount) + taxesFees;

        let dueNow = 0;
        let dueAtHotel = 0;

        if (ratePlan.paymentType === 'PAY_NOW') {
            dueNow = totalAmount;
        } else {
            // PAY_LATER: maybe hold a deposit? Let's say dueNow is 0 and dueAtHotel is full.
            dueAtHotel = totalAmount;
        }

        res.json({
            roomTotal,
            taxesFees,
            discount: discountAmount,
            totalAmount,
            dueNow,
            dueAtHotel,
            nights
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during calculation' });
    }
};

// Step 9: Create temporary hold
exports.createHold = async (req, res) => {
    try {
        const { userId, hotelId, roomId, ratePlanId, checkInDate, checkOutDate, guests, guestDetails, pricing, nights } = req.body;

        const bookingCode = 'BK' + Math.random().toString(36).substr(2, 6).toUpperCase();

        const booking = new Booking({
            userId,
            hotelId,
            roomId,
            ratePlanId,
            guestDetails,
            checkInDate,
            checkOutDate,
            guests,
            nights,
            pricing,
            status: 'HOLD',
            paymentStatus: 'PENDING',
            bookingCode
        });

        await booking.save();
        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create hold' });
    }
};

// Step 10, 11, 12, 13: Checkout -> Process payment -> Confirm -> Email
exports.checkout = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentToken } = req.body; // mock token from frontend

        const booking = await Booking.findById(id).populate('ratePlanId');
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        if (booking.status !== 'HOLD') {
            return res.status(400).json({ error: 'Booking is no longer on hold' });
        }

        const ratePlan = booking.ratePlanId;

        if (ratePlan.paymentType === 'PAY_NOW') {
            if (!paymentToken) {
                // If payment failed (mocked by missing token)
                booking.status = 'CANCELLED';
                await booking.save();
                return res.status(400).json({ error: 'Payment failed, hold released' });
            }
            booking.paymentStatus = 'PAID_IN_FULL';
        } else {
            // PAY_LATER
            booking.paymentStatus = 'PARTIAL_AT_HOTEL'; // Guarantee card was provided
        }

        booking.status = 'CONFIRMED';
        await booking.save();

        // Step 13: Send confirmation email (Mock)
        console.log(`[EMAIL MOCK] Sending confirmation to ${booking.guestDetails.email} for Booking ${booking.bookingCode}`);

        res.json({ success: true, booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Checkout failed' });
    }
};

// Step 14: Show bookings
exports.getUserBookings = async (req, res) => {
    try {
        const { userId } = req.query; // in real app, from auth token
        const bookings = await Booking.find({ userId })
            .populate('hotelId')
            .populate('roomId')
            .populate('ratePlanId')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

// Step 15: Cancel booking
exports.cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate('ratePlanId');
        
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        if (booking.status === 'CANCELLED') return res.status(400).json({ error: 'Already cancelled' });

        const ratePlan = booking.ratePlanId;
        const now = new Date();
        const checkIn = new Date(booking.checkInDate);
        const daysUntilCheckIn = (checkIn - now) / (1000 * 60 * 60 * 24);

        let penaltyAmount = 0;
        let refundAmount = 0;

        if (!ratePlan.cancellationPolicy.isRefundable) {
            penaltyAmount = booking.pricing.totalAmount;
        } else if (daysUntilCheckIn < ratePlan.cancellationPolicy.freeCancellationDaysPrior) {
            // Past the free deadline
            penaltyAmount = booking.pricing.totalAmount * (ratePlan.cancellationPolicy.penaltyPercentage / 100);
        }

        // If user already paid
        if (booking.paymentStatus === 'PAID_IN_FULL') {
            refundAmount = booking.pricing.totalAmount - penaltyAmount;
        }

        booking.status = 'CANCELLED';
        booking.paymentStatus = penaltyAmount > 0 ? (booking.paymentStatus === 'PAID_IN_FULL' ? 'REFUNDED' : 'PENALTY_CHARGED') : 'REFUNDED';
        booking.cancellationDetails = {
            cancelledAt: now,
            penaltyAmount,
            refundAmount
        };

        // Note: For 'PENALTY_CHARGED' on PAY_LATER with no initial charge, 
        // real system would charge the card on file here.

        await booking.save();
        res.json({ success: true, booking });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Cancellation failed' });
    }
};
