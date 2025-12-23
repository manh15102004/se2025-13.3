const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

// Import các model
const User = require('./User');
const Message = require('./Message');
const Conversation = require('./Conversation');
const UserConversation = require('./UserConversation');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const Review = require('./Review');
const Notification = require('./Notification');
const Shipment = require('./Shipment');
const Wishlist = require('./Wishlist');
const Address = require('./Address');
const Voucher = require('./Voucher');
const Follow = require('./Follow');
const ShopLike = require('./ShopLike');

// Định nghĩa các mối quan hệ
User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Quan hệ cuộc trò chuyện (Nhiều-Nhiều)
User.belongsToMany(Conversation, { through: UserConversation, as: 'conversations' });
Conversation.belongsToMany(User, { through: UserConversation, as: 'participants' });

// Quan hệ tin nhắn
Conversation.hasMany(Message, { foreignKey: 'conversationId' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

// Quan hệ sản phẩm
User.hasMany(Product, { foreignKey: 'sellerId' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// Quan hệ đơn hàng
User.hasMany(Order, { foreignKey: 'buyerId', as: 'buyerOrders' });
User.hasMany(Order, { foreignKey: 'sellerId', as: 'sellerOrders' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Order.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Quan hệ giỏ hàng
User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Cart, { foreignKey: 'productId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

// Quan hệ đánh giá
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// Quan hệ thông báo
User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(Notification, { foreignKey: 'orderId' });
Notification.belongsTo(Order, { foreignKey: 'orderId' });

// Quan hệ vận chuyển
User.hasMany(Shipment, { foreignKey: 'shipperId', as: 'shipments' });
Shipment.belongsTo(User, { foreignKey: 'shipperId', as: 'shipper' });

Order.hasOne(Shipment, { foreignKey: 'orderId' });
Shipment.belongsTo(Order, { foreignKey: 'orderId' });

// Quan hệ danh sách yêu thích
User.hasMany(Wishlist, { foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Wishlist, { foreignKey: 'productId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// Quan hệ địa chỉ
User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });

// Quan hệ theo dõi
User.belongsToMany(User, { as: 'Followers', through: Follow, foreignKey: 'followingId', otherKey: 'followerId' });
User.belongsToMany(User, { as: 'Following', through: Follow, foreignKey: 'followerId', otherKey: 'followingId' });

// Quan hệ thích cửa hàng
User.belongsToMany(User, { as: 'LikedShops', through: ShopLike, foreignKey: 'userId', otherKey: 'shopId' });
User.belongsToMany(User, { as: 'ShopLikers', through: ShopLike, foreignKey: 'shopId', otherKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Message,
  Conversation,
  UserConversation,
  Product,
  Order,
  OrderItem,
  Cart,
  Review,
  Notification,
  Shipment,
  Wishlist,
  Address,
  Voucher,
  Follow,
  ShopLike,
};
