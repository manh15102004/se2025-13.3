const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getMySalesOrders,
  approveOrder,
  cancelOrder,
  getOrderById,
} = require('../controllers/orderController');
const {
  getNotifications,
  markAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// Tất cả các route yêu cầu xác thực
router.post('/create', protect, createOrder);
router.get('/my-purchases', protect, getMyOrders);
router.get('/my-sales', protect, getMySalesOrders);
router.put('/:orderId/approve', protect, approveOrder);
router.put('/:orderId/cancel', protect, cancelOrder);
// Thông báo
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markAsRead);

// Route Generic ID (phải đặt cuối cùng)
router.get('/:id', protect, getOrderById);

module.exports = router;
