const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Voucher = sequelize.define('Voucher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING,
    },
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        defaultValue: 'percentage',
    },
    discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    minOrderValue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    maxDiscount: {
        type: DataTypes.DECIMAL(10, 2),
    },
    usageLimit: {
        type: DataTypes.INTEGER,
        defaultValue: null, // null = không giới hạn
    },
    usedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    startDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'Vouchers',
    timestamps: true,
});

module.exports = Voucher;
