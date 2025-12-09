const express = require('express');
const router = express.Router();
const {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/create', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
