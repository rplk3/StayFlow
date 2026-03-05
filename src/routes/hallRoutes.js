const express = require('express');
const router = express.Router();
const {
    getHalls,
    getHallById,
    createHall,
    updateHall,
    deleteHall,
    checkHallAvailability
} = require('../controllers/hallController');

router.get('/', getHalls);
router.get('/:id', getHallById);
router.post('/', createHall);
router.put('/:id', updateHall);
router.delete('/:id', deleteHall);
router.post('/:id/check-availability', checkHallAvailability);

module.exports = router;
