const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Xác thực tùy chọn - thiết lập req.user nếu có token, nhưng không từ chối nếu thiếu token
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      // Không có token - tiếp tục mà không có user
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      // User không hợp lệ - tiếp tục mà không có user
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    // Xác thực token thất bại - tiếp tục mà không có user
    console.log('Optional auth failed:', error.message);
    req.user = null;
    next();
  }
};
