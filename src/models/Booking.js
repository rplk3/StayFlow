import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    guestName: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    dropoffLocation: { type: String, required: true },
    pickupTime: { type: Date, required: true },
    vehicleType: { type: String },
    passengerCount: { type: Number },
    airport: { type: String },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    status: { type: String, default: 'Pending' },
  },
  { timestamps: true },
);

export default mongoose.model('Booking', bookingSchema);

