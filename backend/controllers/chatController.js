const { Conversation, Message, User } = require('../models');

// Lấy hoặc tạo cuộc trò chuyện
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId: otherUserId } = req.body;
    const currentUserId = req.user?.id || req.userId;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID',
      });
    }

    // Kiểm tra người dùng có tồn tại không
    const otherUser = await User.findByPk(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Kiểm tra cuộc trò chuyện đã tồn tại giữa những người dùng này
    const userConversations = await Conversation.findAll({
      include: [{
        model: User,
        as: 'participants',
        where: { id: currentUserId },
        attributes: [],
        through: { attributes: [] },
      }],
    });

    let conversation = null;

    // Duyệt và kiểm tra sự hiện diện của người dùng kia trong cuộc trò chuyện
    // Giả định chủ yếu là chat 1-1. Để chính xác, kiểm tra xem số lượng người tham gia có phải là 2 và có chứa người dùng kia không.
    for (const conv of userConversations) {
      const count = await conv.countParticipants({
        where: { id: otherUserId }
      });
      if (count > 0) {
        conversation = conv;
        break;
      }
    }

    if (!conversation) {
      // Tạo cuộc trò chuyện mới
      conversation = await Conversation.create();
      await conversation.addParticipants([currentUserId, otherUserId]);
    }

    // Trả về chi tiết đầy đủ cuộc trò chuyện
    conversation = await Conversation.findByPk(conversation.id, {
      include: {
        model: User,
        as: 'participants',
        attributes: ['id', 'username', 'fullName', 'avatar', 'email', 'lastSeen'],
        through: { attributes: [] },
      },
    });

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error('getOrCreateConversation Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy danh sách cuộc trò chuyện
// Lấy danh sách cuộc trò chuyện
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.userId;

    // 1. Tìm tất cả ID cuộc trò chuyện mà người dùng tham gia
    // Sử dụng truy vấn hoặc include có lọc để tìm ID trước
    const userConversations = await Conversation.findAll({
      include: [{
        model: User,
        as: 'participants',
        where: { id: currentUserId },
        attributes: [],
        through: { attributes: [] },
      }],
    });

    const conversationIds = userConversations.map(c => c.id);

    if (conversationIds.length === 0) {
      return res.status(200).json({
        success: true,
        conversations: [],
      });
    }

    // 2. Lấy chi tiết đầy đủ cho các ID này (bao gồm TẤT CẢ người tham gia)
    const conversations = await Conversation.findAll({
      where: {
        id: conversationIds
      },
      include: {
        model: User,
        as: 'participants',
        attributes: ['id', 'username', 'fullName', 'avatar', 'email', 'lastSeen'],
        through: { attributes: [] },
      },
      order: [['updatedAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('getConversations Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy tin nhắn từ cuộc trò chuyện
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user?.id || req.userId;

    // Kiểm tra người dùng có trong cuộc trò chuyện không
    const conversation = await Conversation.findByPk(conversationId, {
      include: {
        model: User,
        as: 'participants',
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.id === currentUserId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation',
      });
    }

    const messages = await Message.findAll({
      where: { conversationId },
      include: {
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'avatar'],
      },
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Gửi tin nhắn
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user?.id || req.userId;

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide conversation ID and message content',
      });
    }

    // Kiểm tra người dùng có trong cuộc trò chuyện không
    const conversation = await Conversation.findByPk(conversationId, {
      include: {
        model: User,
        as: 'participants',
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.id === senderId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send message in this conversation',
      });
    }

    // Tìm người nhận
    const receiver = conversation.participants.find(
      (p) => p.id !== senderId
    );

    // Tạo tin nhắn
    const message = await Message.create({
      senderId,
      receiverId: receiver.id,
      conversationId,
      content,
      type: req.body.type || 'text',
    });

    // Cập nhật tin nhắn cuối cùng của cuộc trò chuyện
    const lastMsgContent = req.body.type === 'image' ? '[Hình ảnh]' : content;
    await conversation.update({
      lastMessage: lastMsgContent,
      lastMessageTime: new Date(),
    });

    // Tải lại tin nhắn kèm thông tin người gửi
    const fullMessage = await Message.findByPk(message.id, {
      include: {
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'avatar'],
      },
    });

    res.status(201).json({
      success: true,
      message: fullMessage,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Đánh dấu tin nhắn đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const currentUserId = req.user?.id || req.userId;

    // Kiểm tra người dùng có trong cuộc trò chuyện không
    const conversation = await Conversation.findByPk(conversationId, {
      include: {
        model: User,
        as: 'participants',
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.id === currentUserId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Đánh dấu tất cả tin nhắn là đã đọc
    await Message.update(
      { isRead: true },
      {
        where: {
          conversationId,
          receiverId: currentUserId,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
