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
const { auth } = require('../middleware/auth');

// Public routes
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);

// Protected routes (seller)
router.get('/my-products', auth, getMyProducts);
router.post('/create', auth, createProduct);
router.put('/:productId', auth, updateProduct);
router.delete('/:productId', auth, deleteProduct);

module.exports = router;
