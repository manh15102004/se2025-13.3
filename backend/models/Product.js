const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    image: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM('Thời Trang', 'Đồ gia dụng', 'Công nghệ', 'Thực phẩm', 'Sách', 'Khác'),
      allowNull: false,
      defaultValue: 'Khác',
    },
    subCategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
      defaultValue: 0,
    },
    reviews: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    purchaseCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'sold_out'),
      defaultValue: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Product;
