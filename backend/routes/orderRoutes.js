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
const { auth } = require('../middleware/auth');

// All routes require authentication
router.post('/create', auth, createOrder);
router.get('/my-purchases', auth, getMyOrders);
router.get('/my-sales', auth, getMySalesOrders);
router.put('/:orderId/approve', auth, approveOrder);
router.put('/:orderId/cancel', auth, cancelOrder);

// Notifications
router.get('/notifications', auth, getNotifications);
router.put('/notifications/:notificationId/read', auth, markNotificationAsRead);

module.exports = router;
