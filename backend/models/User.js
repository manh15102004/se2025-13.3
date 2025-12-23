const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
      },
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT({ length: 'long' }),
      defaultValue: 'https://via.placeholder.com/150?text=User',
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('buyer', 'seller', 'shipper', 'admin'),
      defaultValue: 'buyer',
      allowNull: false,
    },
    shippingFeePerOrder: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 20000,
      comment: 'Phí giao hàng mà shipper nhận được cho mỗi đơn hàng hoàn thành',
    },
    facebookId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'ID người dùng Facebook để đăng nhập OAuth',
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      comment: 'Lần cuối người dùng hoạt động, dùng cho trạng thái online/offline',
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Alias để tương thích
User.prototype.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.getPublicData = function () {
  const user = this.toJSON();
  delete user.password;
  return user;
};

module.exports = User;
