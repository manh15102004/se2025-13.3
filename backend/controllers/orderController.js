const { Order, OrderItem, Product, Notification, User } = require('../models');

// Create order (buyer)
exports.createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one item',
      });
    }

    // Group items by seller
    const itemsBySeller = {};
    let totalPrice = 0;

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      const sellerId = product.sellerId;
      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }

      itemsBySeller[sellerId].push({
        ...item,
        price: product.price,
      });

      totalPrice += product.price * item.quantity;
    }

    // Create separate orders for each seller
    const orders = [];
    for (const [sellerId, sellerItems] of Object.entries(itemsBySeller)) {
      const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const order = await Order.create({
        buyerId,
        sellerId: parseInt(sellerId),
        totalPrice: sellerTotal,
        shippingAddress,
        status: 'pending',
      });

      // Create order items
      for (const item of sellerItems) {
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      }

      orders.push(order);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get my purchase orders (buyer)
exports.getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const orders = await Order.findAll({
      where: { buyerId },
      include: [
        {
          association: 'items',
          include: [{ model: Product }],
        },
        {
          association: 'seller',
          attributes: ['id', 'fullName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get my sales orders (seller)
exports.getMySalesOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const orders = await Order.findAll({
      where: { sellerId },
      include: [
        {
          association: 'items',
          include: [{ model: Product }],
        },
        {
          association: 'buyer',
          attributes: ['id', 'fullName', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve order (seller)
exports.approveOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sellerId = req.user.id;
    const { deliveryDate } = req.body;

    console.log(`Approving order: ${orderId} by seller: ${sellerId}`);

    const order = await Order.findOne({
      where: { id: orderId, sellerId },
    });

    if (!order) {
      console.log('Order not found or unauthorized');
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update order status
    await order.update({
      status: 'approved',
      deliveryDate: deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    });

    // Create notification for buyer
    await Notification.create({
      userId: order.buyerId,
      orderId: order.id,
      type: 'order_approved',
      title: 'Đơn hàng được duyệt',
      message: `Đơn hàng #${order.id} của bạn đã được duyệt. Sẽ giao đến ${order.deliveryDate}`,
      deliveryDate: order.deliveryDate,
    });

    res.status(200).json({
      success: true,
      message: 'Order approved successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Only buyer or seller can cancel
    if (order.buyerId !== userId && order.sellerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    await order.update({ status: 'cancelled' });

    // Create notification
    const notifyUserId = order.buyerId === userId ? order.sellerId : order.buyerId;
    await Notification.create({
      userId: notifyUserId,
      orderId: order.id,
      type: 'order_cancelled',
      title: 'Đơn hàng bị hủy',
      message: `Đơn hàng #${order.id} đã bị hủy`,
    });

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: { userId },
      include: [{ model: Order }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await notification.update({ isRead: true });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
