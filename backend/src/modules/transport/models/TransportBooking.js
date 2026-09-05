const mongoose = require('mongoose');

const transportBookingSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  dropoffLocation: { type: String, required: true },
  pickupTime: { type: Date, required: true },
  vehicleType: { type: String },
  passengerCount: { type: Number },
  airport: { type: String },
  paymentMethod: { type: String, enum: ['Cash', 'Card'], default: 'Cash' },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
  status: { type: String, enum: ['Pending', 'Confirmed', 'On the Way', 'Completed', 'Cancelled'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('TransportBooking', transportBookingSchema);
