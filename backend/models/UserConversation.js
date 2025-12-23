const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserConversation = sequelize.define('UserConversation', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Users', // Kiểm tra xem bảng User của bạn tên là 'Users' hay 'users'
            key: 'id',
        },
    },
    conversationId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Conversations', // Kiểm tra tên bảng
            key: 'id',
        },
    },
});

module.exports = UserConversation;
