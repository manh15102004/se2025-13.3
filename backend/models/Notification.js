const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define(
  'Notification',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('order_approved', 'order_shipped', 'order_delivered', 'order_cancelled'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Notification;
