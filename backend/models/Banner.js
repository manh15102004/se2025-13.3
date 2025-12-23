const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Banner = sequelize.define('Banner', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    shopId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Có thể là banner hệ thống (null) hoặc của cửa hàng
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    subtitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    targetType: {
        type: DataTypes.ENUM('product', 'category', 'shop', 'none'),
        defaultValue: 'none'
    },
    targetValue: {
        type: DataTypes.STRING,
        allowNull: true
    },
    startDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    // Định dạng font cho tiêu đề
    titleFontFamily: {
        type: DataTypes.STRING,
        defaultValue: 'System'
    },
    titleFontSize: {
        type: DataTypes.INTEGER,
        defaultValue: 24
    },
    titleFontWeight: {
        type: DataTypes.STRING,
        defaultValue: 'bold'
    },
    titleFontStyle: {
        type: DataTypes.STRING,
        defaultValue: 'normal'
    },
    // Định dạng font cho phụ đề
    subtitleFontFamily: {
        type: DataTypes.STRING,
        defaultValue: 'System'
    },
    subtitleFontSize: {
        type: DataTypes.INTEGER,
        defaultValue: 14
    },
    subtitleFontWeight: {
        type: DataTypes.STRING,
        defaultValue: 'normal'
    },
    subtitleFontStyle: {
        type: DataTypes.STRING,
        defaultValue: 'normal'
    },
    // Màu chữ
    titleColor: {
        type: DataTypes.STRING,
        defaultValue: '#ffffff'
    },
    subtitleColor: {
        type: DataTypes.STRING,
        defaultValue: '#ffffff'
    },
    // Vị trí chữ (dựa trên phần trăm để đáp ứng)
    titlePositionX: {
        type: DataTypes.INTEGER,
        defaultValue: 5 // phần trăm từ trái
    },
    titlePositionY: {
        type: DataTypes.INTEGER,
        defaultValue: 30 // phần trăm từ trên
    },
    subtitlePositionX: {
        type: DataTypes.INTEGER,
        defaultValue: 5
    },
    subtitlePositionY: {
        type: DataTypes.INTEGER,
        defaultValue: 50
    }
}, {
    timestamps: true
});

module.exports = Banner;
