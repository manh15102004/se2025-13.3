const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define(
  'Message',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Có thể null cho chat nhóm trong tương lai
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'text', // 'text', 'image', 'sticker'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Message;
