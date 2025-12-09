const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getMySalesOrders,
  approveOrder,
  cancelOrder,
  getNotifications,
  markNotificationAsRead,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.post('/create', protect, createOrder);
router.get('/my-purchases', protect, getMyOrders);
router.get('/my-sales', protect, getMySalesOrders);
router.put('/:orderId/approve', protect, approveOrder);
router.put('/:orderId/cancel', protect, cancelOrder);

// Notifications
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:notificationId/read', protect, markNotificationAsRead);

module.exports = router;
