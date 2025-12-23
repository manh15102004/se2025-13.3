const express = require('express');
const router = express.Router();
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Tất cả các route đều được bảo vệ
router.use(protect);

router.post('/conversation', getOrCreateConversation);
router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/message', sendMessage);
router.put('/mark-as-read', markAsRead);

module.exports = router;
