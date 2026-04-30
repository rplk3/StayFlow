const express = require('express');
const router = express.Router();
const adminHotelController = require('../controllers/adminHotelController');
const { protect } = require('../../../middleware/authMiddleware');

// All routes are protected (admin only)
router.use(protect);

// CRUD
router.get('/', adminHotelController.getAllHotels);
router.get('/:id', adminHotelController.getHotelById);
router.post('/', adminHotelController.createHotel);
router.put('/:id', adminHotelController.updateHotel);
router.delete('/:id', adminHotelController.deleteHotel);

// Status toggle
router.put('/:id/status', adminHotelController.updateHotelStatus);

// Image upload
router.post('/:id/images', adminHotelController.uploadHotelImages);

module.exports = router;
