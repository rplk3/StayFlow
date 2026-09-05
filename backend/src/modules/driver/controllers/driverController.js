const Driver = require('../models/Driver');

// Admin CRUD operations
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ status: 'Approved' });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find({ status: 'Pending' });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createDriver = async (req, res) => {
  try {
    // Direct admin creation bypasses pending state
    const data = { ...req.body, status: req.body.status || 'Approved' };
    
    // Assign a default password if not provided
    if (!data.password) {
      data.password = 'driver123';
    }

    if (!data.email) {
      data.email = `${data.name.replace(/\s+/g, '').toLowerCase()}${Math.floor(Math.random() * 1000)}@driver.com`;
    }

    const newDriver = await Driver.create(data);
    res.status(201).json(newDriver);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating driver' });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const updated = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Driver not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    const deleted = await Driver.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Driver deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.approveDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    
    driver.status = 'Approved';
    await driver.save();
    
    res.json({ message: 'Driver approved', driver });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.rejectDriver = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    
    driver.status = 'Rejected';
    await driver.save();
    
    res.json({ message: 'Driver rejected', driver });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
