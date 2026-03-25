const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../../../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);

// Admin-specific routes
router.post('/admin-register', authController.registerAdmin);
router.post('/admin-login', authController.loginAdmin);
router.get('/pending-admins', protect, authController.getPendingAdmins);
router.put('/approve-admin/:id', protect, authController.approveAdmin);

module.exports = router;
