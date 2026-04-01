const express = require('express');
const router = express.Router();
const adminRoomController = require('../controllers/adminRoomController');
const { protect } = require('../../../middleware/authMiddleware');

// All routes are protected (admin only)
router.use(protect);

// Hotels list for dropdowns (must be before /:id)
router.get('/hotels-list', adminRoomController.getHotelsList);

// CRUD
router.get('/', adminRoomController.getAllRooms);
router.get('/:id', adminRoomController.getRoomById);
router.post('/', adminRoomController.createRoom);
router.put('/:id', adminRoomController.updateRoom);
router.delete('/:id', adminRoomController.deleteRoom);

// Status update
router.put('/:id/status', adminRoomController.updateRoomStatus);

module.exports = router;
