const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/query', chatController.handleChatQuery);

module.exports = router;
