const { Conversation, Message, User } = require('../models');

// Get or create conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { userId: otherUserId } = req.body;
    const currentUserId = req.userId;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide user ID',
      });
    }

    // Check if user exists
    const otherUser = await User.findByPk(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      include: {
        model: User,
        as: 'participants',
        where: { id: currentUserId },
        through: { attributes: [] },
      },
    });

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create();
      await conversation.addParticipants([currentUserId, otherUserId]);
    }

    // Reload with participants
    conversation = await Conversation.findByPk(conversation.id, {
      include: {
        model: User,
        as: 'participants',
        attributes: ['id', 'username', 'avatar', 'email'],
        through: { attributes: [] },
      },
    });

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get conversations
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.userId;

    const conversations = await Conversation.findAll({
      include: {
        model: User,
        as: 'participants',
        where: { id: currentUserId },
        attributes: ['id', 'username', 'avatar', 'email'],
        through: { attributes: [] },
      },
      order: [['updatedAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get messages from conversation
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.userId;

    // Check if user is part of conversation
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

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.userId;

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide conversation ID and message content',
      });
    }

    // Check if user is part of conversation
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

    // Find receiver
    const receiver = conversation.participants.find(
      (p) => p.id !== senderId
    );

    // Create message
    const message = await Message.create({
      senderId,
      receiverId: receiver.id,
      conversationId,
      content,
    });

    // Update conversation last message
    await conversation.update({
      lastMessage: content,
      lastMessageTime: new Date(),
    });

    // Reload message with sender
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

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const currentUserId = req.userId;

    // Check if user is part of conversation
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

    // Mark all messages as read
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
