const express = require('express');
const router = express.Router();
const {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Các route công khai
router.get('/product/:productId', getProductReviews);

// Các route được bảo vệ
router.post('/create', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
