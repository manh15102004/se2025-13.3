const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

// Tất cả các route yêu cầu xác thực
router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.put('/:cartItemId', protect, updateCartItem);
router.delete('/:cartItemId', protect, removeFromCart);
router.delete('/', protect, clearCart);

module.exports = router;
