const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Create MoMo payment (requires authentication)
router.post('/momo/create', protect, paymentController.createMoMoPayment);

// MoMo callback (no auth required - called by MoMo)
router.get('/momo/callback', paymentController.momoCallback);

// MoMo IPN (no auth required - called by MoMo)
router.post('/momo/ipn', paymentController.momoIPN);

// Check payment status (requires authentication)
router.get('/status/:orderId', protect, paymentController.checkPaymentStatus);

module.exports = router;
