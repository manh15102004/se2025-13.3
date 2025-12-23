const { Cart, User } = require('../models');

// Get cart for current user
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

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, price } = req.body;

    if (!productId || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide productId, quantity, and price',
      });
    }

    // Check if item already in cart
    const existingItem = await Cart.findOne({
      where: { userId, productId },
    });

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
      await existingItem.save();
      
      return res.status(200).json({
        success: true,
        message: 'Item quantity updated',
        data: existingItem,
      });
    }

    // Create new cart item
    const cartItem = await Cart.create({
      userId,
      productId,
      quantity,
      price,
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

// Update cart item quantity
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

// Remove item from cart
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

// Clear cart
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
