const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Tạo thanh toán MoMo (yêu cầu xác thực)
router.post('/momo/create', protect, paymentController.createMoMoPayment);

// Callback MoMo (không yêu cầu xác thực - được gọi bởi MoMo)
router.get('/momo/callback', paymentController.momoCallback);

// MoMo IPN (không yêu cầu xác thực - được gọi bởi MoMo)
router.post('/momo/ipn', paymentController.momoIPN);

// Kiểm tra trạng thái thanh toán (yêu cầu xác thực)
router.get('/status/:orderId', protect, paymentController.checkPaymentStatus);

module.exports = router;
