const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.get('/', auth, getCart);
router.post('/add', auth, addToCart);
router.put('/:cartItemId', auth, updateCartItem);
router.delete('/:cartItemId', auth, removeFromCart);
router.delete('/', auth, clearCart);

module.exports = router;
