const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shipperId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shippingFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'shipping', 'delivered', 'cancelled'),
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.ENUM('COD', 'MoMo', 'Card'),
      defaultValue: 'COD',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'failed'),
      defaultValue: 'pending',
    },
    momoTransactionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Order;
