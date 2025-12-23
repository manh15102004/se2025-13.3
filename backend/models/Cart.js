const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cart = sequelize.define(
  'Cart',
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
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING(10),
      allowNull: true, // Tùy chọn cho các mặt hàng không phải thời trang
    },
  },
  {
    timestamps: true,
    // Đã xóa ràng buộc duy nhất để cho phép cùng một sản phẩm với các kích thước khác nhau
  }
);

module.exports = Cart;
