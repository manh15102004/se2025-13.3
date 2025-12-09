const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const shipperController = require('../controllers/shipperController');

router.get('/available-orders', protect, shipperController.getAvailableOrders);
router.post('/accept-order/:orderId', protect, shipperController.acceptOrder);
router.get('/my-deliveries', protect, shipperController.getMyDeliveries);
router.put('/update-status/:orderId', protect, shipperController.updateDeliveryStatus);
router.post('/complete-delivery/:orderId', protect, shipperController.completeDelivery);
router.post('/cancel-delivery/:orderId', protect, shipperController.cancelDelivery);

module.exports = router;
