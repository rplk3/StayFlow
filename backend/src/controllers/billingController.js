const Booking = require('../models/Booking');
const { calculateBilling } = require('../services/billingService');

const calculate = async (req, res) => {
    try {
        const { bookingId, checkInDate, checkOutDate, basePricePerNight, extras, discount } = req.body;

        let billing;

        if (bookingId) {
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'Booking not found' });
            }
            billing = calculateBilling(
                booking.checkInDate,
                booking.checkOutDate,
                booking.basePricePerNight,
                booking.extras,
                booking.billing.discount || 0
            );
        } else {
            if (!checkInDate || !checkOutDate || !basePricePerNight) {
                return res.status(400).json({ message: 'Missing required billing inputs' });
            }
            billing = calculateBilling(checkInDate, checkOutDate, basePricePerNight, extras || [], discount || 0);
        }

        res.json(billing);
    } catch (error) {
        console.error('Error calculating billing:', error);
        res.status(500).json({ message: 'Server error calculating billing' });
    }
};

module.exports = {
    calculate
};
