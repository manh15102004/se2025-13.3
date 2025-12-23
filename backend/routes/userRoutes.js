const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/follow/:id', protect, userController.followUser);
router.post('/unfollow/:id', protect, userController.unfollowUser);
router.post('/like-shop/:id', protect, userController.likeShop);
router.post('/unlike-shop/:id', protect, userController.unlikeShop);
router.get('/featured-shops', userController.getFeaturedShops);

module.exports = router;
