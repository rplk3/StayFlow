import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  availability: { type: Boolean, default: true },
});

export default mongoose.model('Driver', driverSchema);

