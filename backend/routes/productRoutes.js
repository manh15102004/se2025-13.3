const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getFeaturedProducts,
  getProductById, // Thêm import
  getShopProducts, // Thêm import
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, optionalAuth } = require('../middleware/auth');

// Các route công khai
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', optionalAuth, getProductById); // Mới: Lấy chi tiết sản phẩm
router.get('/shop/:shopId', optionalAuth, getShopProducts); // Thêm optionalAuth

// Các route được bảo vệ (người bán)
router.get('/my-products', protect, getMyProducts);
router.post('/create', protect, createProduct);
router.put('/:productId', protect, updateProduct);
router.delete('/:productId', protect, deleteProduct);

module.exports = router;
