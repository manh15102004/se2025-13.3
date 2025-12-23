const { Cart, User } = require('../models');

// Lấy giỏ hàng của người dùng hiện tại
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.findAll({
      where: { userId },
    });

    res.status(200).json({
      success: true,
      data: cartItems,
      total: cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Thêm sản phẩm vào giỏ hàng
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, price, size } = req.body;

    if (!productId || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId, quantity, and price',
      });
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa (cùng sản phẩm VÀ cùng kích thước)
    const whereClause = { userId, productId };
    if (size) {
      whereClause.size = size;
    } else {
      whereClause.size = null;
    }

    const existingItem = await Cart.findOne({ where: whereClause });

    if (existingItem) {
      // Cập nhật số lượng
      existingItem.quantity += quantity;
      await existingItem.save();

      return res.status(200).json({
        success: true,
        message: 'Item quantity updated',
        data: existingItem,
      });
    }

    // Tạo mục giỏ hàng mới
    const cartItem = await Cart.create({
      userId,
      productId,
      quantity,
      price,
      size: size || null,
    });

    res.status(201).json({
      success: true,
      message: 'Item added to cart',
      data: cartItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const cartItem = await Cart.findOne({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cartItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa sản phẩm khỏi giỏ hàng
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cartItemId } = req.params;

    const cartItem = await Cart.findOne({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found',
      });
    }

    await cartItem.destroy();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Xóa toàn bộ giỏ hàng
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await Cart.destroy({
      where: { userId },
    });

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
