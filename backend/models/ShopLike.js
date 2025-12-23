const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShopLike = sequelize.define('ShopLike', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    shopId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // Cửa hàng là một Người dùng
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'shopId']
        }
    ]
});

module.exports = ShopLike;
