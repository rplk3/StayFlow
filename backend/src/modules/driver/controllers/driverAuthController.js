const Driver = require('../models/Driver');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

exports.registerDriver = async (req, res) => {
  try {
    const { email, licenseNumber } = req.body;

    const driverExists = await Driver.findOne({ email });
    if (driverExists) {
      return res.status(400).json({ message: 'Driver with this email already exists' });
    }

    const licenseExists = await Driver.findOne({ licenseNumber });
    if (licenseExists) {
      return res.status(400).json({ message: 'Driver with this license number already exists' });
    }

    const driver = await Driver.create(req.body);

    res.status(201).json({
      _id: driver._id,
      name: driver.name,
      email: driver.email,
      status: driver.status,
      message: 'Registration successful. Waiting for admin approval.',
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await driver.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (driver.status === 'Pending') {
      return res.status(403).json({ message: 'Your account is pending admin approval' });
    }

    if (driver.status === 'Rejected') {
      return res.status(403).json({ message: 'Your account has been rejected by the admin' });
    }

    res.json({
      _id: driver._id,
      name: driver.name,
      email: driver.email,
      contact: driver.contact,
      licenseNumber: driver.licenseNumber,
      nic: driver.nic,
      address: driver.address,
      vehicle: driver.vehicle,
      status: driver.status,
      availability: driver.availability,
      token: generateToken(driver._id),
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const TransportBooking = require('../../transport/models/TransportBooking');

exports.getMyBookings = async (req, res) => {
  try {
    const driverId = req.driver._id;
    const bookings = await TransportBooking.find({ driver: driverId })
      .populate('vehicle')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Get Bookings Error:', error);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

exports.updateTripStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const driverId = req.driver._id;

    const booking = await TransportBooking.findOne({ _id: id, driver: driverId });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not assigned to you' });
    }

    booking.status = status;
    await booking.save();

    // Optionally update driver availability
    if (status === 'On the Way') {
      req.driver.availability = false;
    } else if (status === 'Completed' || status === 'Cancelled') {
      req.driver.availability = true;
    }
    await req.driver.save();

    res.json({ message: 'Trip status updated', booking });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: 'Server error updating trip status' });
  }
};
