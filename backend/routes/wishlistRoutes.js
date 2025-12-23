const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    addToWishlist,
    removeFromWishlist,
    getMyWishlist,
    checkWishlistStatus,
} = require('../controllers/wishlistController');

// Tất cả các route yêu cầu xác thực
router.post('/', protect, addToWishlist);
router.delete('/:productId', protect, removeFromWishlist);
router.get('/', protect, getMyWishlist);
router.get('/check/:productId', protect, checkWishlistStatus);

module.exports = router;
