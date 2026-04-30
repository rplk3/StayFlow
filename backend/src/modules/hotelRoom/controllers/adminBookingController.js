const Booking = require('../models/Booking');

exports.getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 15, search, status, hotelId } = req.query;
        
        const query = {};
        if (status) query.status = status;
        if (hotelId) query.hotelId = hotelId;
        
        if (search) {
            query.$or = [
                { 'guestDetails.firstName': { $regex: search, $options: 'i' } },
                { 'guestDetails.lastName': { $regex: search, $options: 'i' } },
                { 'guestDetails.email': { $regex: search, $options: 'i' } },
                { bookingCode: { $regex: search, $options: 'i' } }
            ];
        }

        const bookings = await Booking.find(query)
            .populate('hotelId', 'name destination')
            .populate('roomId', 'roomNumber roomType')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Booking.countDocuments(query);

        res.json({
            bookings,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            total: count
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('hotelId', 'name destination email phone')
            .populate('roomId', 'roomNumber roomType basePrice floor');
            
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch booking', error: err.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['HOLD', 'CONFIRMED', 'FORWARDED', 'CANCELLED', 'NO_SHOW'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        res.json({ message: 'Status updated successfully', booking });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update status', error: err.message });
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        res.json({ message: 'Booking deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete booking', error: err.message });
    }
};
