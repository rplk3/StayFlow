const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

router.get('/', driverController.getAllDrivers);
router.get('/pending', driverController.getPendingDrivers);
router.post('/', driverController.createDriver);
router.put('/:id', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);

router.put('/:id/approve', driverController.approveDriver);
router.put('/:id/reject', driverController.rejectDriver);

module.exports = router;
