const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getFeaturedProducts,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);

// Protected routes (seller)
router.get('/my-products', protect, getMyProducts);
router.post('/create', protect, createProduct);
router.put('/:productId', protect, updateProduct);
router.delete('/:productId', protect, deleteProduct);

module.exports = router;
