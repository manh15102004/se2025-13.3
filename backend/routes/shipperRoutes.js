const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const shipperController = require('../controllers/shipperController');
const shipperStatsController = require('../controllers/shipperStatsController');

// Các route thống kê
router.get('/stats', protect, shipperStatsController.getShipperStats);
router.get('/earnings', protect, shipperStatsController.getShipperEarnings);

// Các route đơn hàng
router.get('/available-orders', protect, shipperController.getAvailableOrders);
router.post('/accept-order/:orderId', protect, shipperController.acceptOrder);
router.get('/my-deliveries', protect, shipperController.getMyDeliveries);
router.put('/update-status/:orderId', protect, shipperController.updateDeliveryStatus);
router.post('/complete-delivery/:orderId', protect, shipperController.completeDelivery);
router.post('/cancel-delivery/:orderId', protect, shipperController.cancelDelivery);

module.exports = router;
