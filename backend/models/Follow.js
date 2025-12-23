const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Follow = sequelize.define('Follow', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    followerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    followingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Đây là Cửa hàng (Người dùng) đang được theo dõi
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['followerId', 'followingId']
        }
    ]
});

module.exports = Follow;
