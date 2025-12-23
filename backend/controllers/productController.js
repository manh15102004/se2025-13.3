const { Product } = require('../models');

// Get all products (with filters)
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, sellerId } = req.query;
    const where = { status: 'active' };

    if (category) where.category = category;
    if (sellerId) where.sellerId = sellerId;
    if (search) {
      where.name = sequelize.where(
        sequelize.fn('LOWER', sequelize.col('name')),
        'LIKE',
        `%${search.toLowerCase()}%`
      );
    }

    const products = await Product.findAll({
      where,
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

// Get featured products (high ratings + purchase count)
exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        status: 'active',
        rating: { [require('sequelize').Op.gte]: 4.0 } // Minimum rating 4.0
      },
      order: [
        [require('sequelize').literal('(purchaseCount * 0.6 + rating * 0.4)'), 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: 15, // Top 15 featured products
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

// Get my products (seller)
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

// Create product (seller)
// Create product (seller)
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
      subCategory: subCategory || null, // Ensure empty string becomes null if preferred, or keep as is
      quantity: quantity || 0,
      image: image || '📦',
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    console.error('Create Product Error:', error); // Added logging
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update product
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
      subCategory: subCategory, // Allow update even if it's new
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

// Delete product
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
