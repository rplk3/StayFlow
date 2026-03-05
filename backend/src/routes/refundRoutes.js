const express = require('express');
const router = express.Router();
const { processRefund, getAdminRefunds } = require('../controllers/refundController');

router.post('/', processRefund);
router.get('/admin', getAdminRefunds);

module.exports = router;
