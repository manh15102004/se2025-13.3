const { Product, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// Lấy tất cả sản phẩm (có bộ lọc)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, sellerId } = req.query;
    const where = { status: 'active' };

    if (category) where.category = category;
    if (sellerId) where.sellerId = sellerId;
    if (search) {
      where[Op.or] = [
        sequelize.where(
          sequelize.fn('LOWER', sequelize.col('Product.name')),
          'LIKE',
          `%${search.toLowerCase()}%`
        ),
        sequelize.where(
          sequelize.fn('LOWER', sequelize.col('seller.fullName')),
          'LIKE',
          `%${search.toLowerCase()}%`
        )
      ];
    }

    const products = await Product.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'fullName', 'avatar', 'role'] // Bao gồm thông tin người bán
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy sản phẩm nổi bật (đánh giá cao + lượt mua nhiều)
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        status: 'active',
        rating: { [require('sequelize').Op.gte]: 4.0 } // Đánh giá tối thiểu 4.0
      },
      order: [
        [require('sequelize').literal('(purchaseCount * 0.7 + rating * 0.3)'), 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: 5, // Top 5 sản phẩm nổi bật
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'fullName', 'avatar', 'role']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
    });
  }
};
// Lấy chi tiết một sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'fullName', 'avatar', 'role', 'shopName', 'email', 'phone', 'address']
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// MỚI: Lấy sản phẩm theo ID Cửa hàng (Công khai)
exports.getShopProducts = async (req, res) => {
  try {
    const { shopId } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    // Kiểm tra cửa hàng có tồn tại không
    const shop = await User.findByPk(shopId, {
      attributes: ['id', 'fullName', 'avatar', 'role', 'email', 'phone', 'address', 'lastSeen']
    });

    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const products = await Product.findAll({
      where: {
        sellerId: shopId,
        status: 'active'
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'fullName', 'avatar']
        }
      ]
    });

    // --- Tính toán thống kê ---
    // 1. Số lượng người theo dõi
    const followersCount = await sequelize.models.Follow.count({
      where: { followingId: shopId }
    });

    // 2. Số lượt thích (Thích cửa hàng)
    const likesCount = await sequelize.models.ShopLike.count({
      where: { shopId: shopId }
    });

    // 3. Đánh giá trung bình (Tổng hợp từ tất cả sản phẩm của cửa hàng này)
    const ratingStats = await sequelize.models.Review.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('Review.rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('Review.rating')), 'totalReviews']
      ],
      include: [{
        model: Product,
        attributes: [],
        where: { sellerId: shopId }
      }],
      raw: true
    });

    // 4. Trạng thái người dùng (nếu đã đăng nhập)
    let isFollowed = false;
    let isLiked = false;

    if (currentUserId) {
      const follow = await sequelize.models.Follow.findOne({
        where: { followerId: currentUserId, followingId: shopId }
      });
      isFollowed = !!follow;

      const like = await sequelize.models.ShopLike.findOne({
        where: { userId: currentUserId, shopId: shopId }
      });
      isLiked = !!like;
    }

    res.status(200).json({
      success: true,
      data: {
        shop: {
          ...shop.toJSON(),
          followersCount,
          likesCount,
          avgRating: ratingStats ? parseFloat(ratingStats.avgRating || 0).toFixed(1) : 0,
          totalReviews: ratingStats ? parseInt(ratingStats.totalReviews || 0) : 0,
          isFollowed,
          isLiked
        },
        products
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy sản phẩm của tôi (người bán)
exports.getMyProducts = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const products = await Product.findAll({
      where: { sellerId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Tạo sản phẩm (người bán)
// Tạo sản phẩm (người bán)
exports.createProduct = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { name, description, price, category, subCategory, quantity, image } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, price, and category',
      });
    }

    const product = await Product.create({
      sellerId,
      name,
      description,
      price,
      category,
      subCategory: subCategory || null, // Đảm bảo chuỗi rỗng trở thành null nếu muốn
      quantity: quantity || 0,
      image: image || null,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create Product Error:', error); // Thêm log lỗi
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user.id;
    const { name, description, price, category, subCategory, quantity, status, image } = req.body;

    const product = await Product.findOne({
      where: { id: productId, sellerId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.update({
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      category: category || product.category,
      subCategory: subCategory, // Cho phép cập nhật cả khi là null
      quantity: quantity !== undefined ? quantity : product.quantity,
      status: status || product.status,
      image: image || product.image,
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const sellerId = req.user.id;

    const product = await Product.findOne({
      where: { id: productId, sellerId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
