const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Message = require('./Message');
const Conversation = require('./Conversation');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const Review = require('./Review');
const Notification = require('./Notification');
const Shipment = require('./Shipment');

// Define associations
User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Conversation, { foreignKey: 'user1Id' });
User.hasMany(Conversation, { foreignKey: 'user2Id' });
Conversation.belongsTo(User, { foreignKey: 'user1Id', as: 'user1' });
Conversation.belongsTo(User, { foreignKey: 'user2Id', as: 'user2' });

// Product associations
User.hasMany(Product, { foreignKey: 'sellerId' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// Order associations
User.hasMany(Order, { foreignKey: 'buyerId' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

User.hasMany(Order, { foreignKey: 'sellerId', as: 'sales_orders' });
Order.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Cart associations
User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

// Review associations
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(Notification, { foreignKey: 'orderId' });
Notification.belongsTo(Order, { foreignKey: 'orderId' });

// Shipment associations
User.hasMany(Shipment, { foreignKey: 'shipperId', as: 'shipments' });
Shipment.belongsTo(User, { foreignKey: 'shipperId', as: 'shipper' });

Order.hasOne(Shipment, { foreignKey: 'orderId' });
Shipment.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = {
  sequelize,
  User,
  Message,
  Conversation,
  Product,
  Order,
  OrderItem,
  Cart,
  Review,
  Notification,
  Shipment,
};
