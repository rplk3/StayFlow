const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  type: { type: String, required: true },
  make: { type: String },
  model: { type: String },
  year: { type: Number },
  plateNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'In Use', 'Maintenance', 'Unavailable'], default: 'Available' },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
