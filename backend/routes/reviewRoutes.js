const express = require('express');
const router = express.Router();
const {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
} = require('../controllers/reviewController');
const { auth } = require('../middleware/auth');

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/create', auth, createReview);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;
