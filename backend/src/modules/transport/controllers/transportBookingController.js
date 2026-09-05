const TransportBooking = require('../models/TransportBooking');

const validateFuturePickupTime = (pickupTime) => {
  if (!pickupTime) return 'Pickup date/time is required';
  const parsed = new Date(pickupTime);
  if (Number.isNaN(parsed.getTime())) return 'Invalid pickup date/time format';
  if (parsed.getTime() < Date.now()) return 'Pickup date/time cannot be in the past';
  return null;
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await TransportBooking.find()
      .populate('vehicle')
      .populate('driver')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const timeError = validateFuturePickupTime(req.body.pickupTime);
    if (timeError) return res.status(400).json({ message: timeError });

    const newBooking = await TransportBooking.create(req.body);
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating booking' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await TransportBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    await booking.save();
    
    res.json({ message: 'Status updated', booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.assignBooking = async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;
    const booking = await TransportBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (driverId) booking.driver = driverId;
    if (vehicleId) booking.vehicle = vehicleId;
    
    // Auto confirm if both are assigned
    if (booking.driver && booking.vehicle) {
      booking.status = 'Confirmed';
    }

    await booking.save();
    res.json({ message: 'Booking assigned', booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    if (Object.prototype.hasOwnProperty.call(req.body, 'pickupTime')) {
      const timeError = validateFuturePickupTime(req.body.pickupTime);
      if (timeError) return res.status(400).json({ message: timeError });
    }

    const updated = await TransportBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Booking not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const deleted = await TransportBooking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Booking not found' });
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
