import express from 'express';
import nodemailer from 'nodemailer';
import Booking from '../models/Booking.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// GET all bookings (with populated driver & vehicle)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicle driver')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new booking
router.post('/', async (req, res) => {
  const booking = new Booking(req.body);
  try {
    const newBooking = await booking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT — update booking status (Pending → On the Way → Completed)
// ⚠️  This is the WARNING-TRIGGERING route: status changes drive real-time DB warnings
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['Pending', 'Confirmed', 'On the Way', 'Completed', 'Cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
  }

  try {
    const booking = await Booking.findById(req.params.id).populate('driver vehicle');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const oldStatus = booking.status;
    booking.status = status;

    // When completed → free up driver & vehicle
    if (status === 'Completed' && oldStatus !== 'Completed') {
      if (booking.driver) {
        await Driver.findByIdAndUpdate(booking.driver._id, { availability: true });
      }
      if (booking.vehicle) {
        await Vehicle.findByIdAndUpdate(booking.vehicle._id, { status: 'Available' });
      }

      // ── Send email on completion (optional, won't crash if SMTP not set) ──
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter
          .sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Replace with guest email in production
            subject: 'Trip Completed – GuestGo',
            text: `Your trip "${booking.pickupLocation} → ${booking.dropoffLocation}" has been completed. Thank you for using GuestGo!`,
          })
          .catch(console.error);
      }
    }

    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT — assign driver & vehicle to booking
router.put('/:id/assign', async (req, res) => {
  const { driverId, vehicleId } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    const driver = await Driver.findById(driverId);
    const vehicle = await Vehicle.findById(vehicleId);

    if (!driver) return res.status(404).json({ msg: 'Driver not found' });
    if (!vehicle) return res.status(404).json({ msg: 'Vehicle not found' });

    if (!driver.availability || vehicle.status !== 'Available') {
      return res.status(400).json({ msg: 'Driver or vehicle not available' });
    }

    booking.driver = driverId;
    booking.vehicle = vehicleId;
    booking.status = 'Confirmed';

    driver.availability = false;
    vehicle.status = 'In Use';

    await driver.save();
    await vehicle.save();
    await booking.save();

    // Send confirmation email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter
        .sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: 'Transport Booking Confirmed – GuestGo',
          text: `Your transport is confirmed!\nDriver: ${driver.name}\nContact: ${driver.contact}\nVehicle: ${vehicle.type} (${vehicle.plateNumber})`,
        })
        .catch(console.error);
    }

    const populated = await Booking.findById(booking._id).populate('driver vehicle');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Not found' });

    // Free up driver and vehicle if assigned
    if (booking.driver) await Driver.findByIdAndUpdate(booking.driver, { availability: true });
    if (booking.vehicle) await Vehicle.findByIdAndUpdate(booking.vehicle, { status: 'Available' });

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
