import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  type: { type: String, required: true },
  plateNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  status: { type: String, default: 'Available' },
});

export default mongoose.model('Vehicle', vehicleSchema);

