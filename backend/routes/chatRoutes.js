const express = require('express');
const router = express.Router();
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
} = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

// All routes are protected
router.use(auth);

router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/message', sendMessage);
router.put('/mark-as-read', markAsRead);

module.exports = router;
