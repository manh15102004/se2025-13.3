const { Order, OrderItem, Product, Notification, User } = require('../models');

// Tạo đơn hàng (người mua)
exports.createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { items, shippingAddress } = req.body;

    console.log('=== CREATE ORDER REQUEST ===');
    console.log('Buyer ID:', buyerId);
    console.log('Items:', JSON.stringify(items, null, 2));
    console.log('Shipping Address:', shippingAddress);

    // Kiểm tra dữ liệu (Validation)
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Validation failed: No items provided');
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one item',
      });
    }

    if (!shippingAddress || shippingAddress.trim() === '') {
      console.error('Validation failed: No shipping address');
      return res.status(400).json({
        success: false,
        message: 'Please provide a shipping address',
      });
    }

    // Nhóm các sản phẩm theo người bán
    const itemsBySeller = {};
    let totalPrice = 0;

    for (const item of items) {
      console.log('Processing item:', item);

      if (!item.productId || !item.quantity) {
        console.error('Invalid item:', item);
        return res.status(400).json({
          success: false,
          message: 'Each item must have productId and quantity',
        });
      }

      const product = await Product.findByPk(item.productId);
      console.log('Found product:', product ? {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        sellerId: product.sellerId
      } : null);

      if (!product) {
        console.error('Product not found:', item.productId);
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
      }

      // Kiểm tra tồn kho
      if (product.quantity < item.quantity) {
        console.error('Insufficient stock:', product.name, 'Available:', product.quantity, 'Requested:', item.quantity);
        return res.status(400).json({
          success: false,
          message: `Không đủ hàng cho sản phẩm "${product.name}". Còn lại: ${product.quantity}`,
        });
      }

      const sellerId = product.sellerId;
      if (!sellerId) {
        console.error('Product has no seller:', product.id);
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} has no seller assigned`,
        });
      }

      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }

      itemsBySeller[sellerId].push({
        ...item,
        price: product.price,
      });

      totalPrice += product.price * item.quantity;
    }

    console.log('Items grouped by seller:', Object.keys(itemsBySeller).length, 'sellers');

    // Tạo các đơn hàng riêng biệt cho từng người bán
    const orders = [];
    const defaultShippingFee = 20000;

    for (const [sellerId, sellerItems] of Object.entries(itemsBySeller)) {
      const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      console.log('Creating order for seller:', sellerId, 'Total:', sellerTotal);

      const order = await Order.create({
        buyerId,
        sellerId: parseInt(sellerId),
        totalAmount: sellerTotal + defaultShippingFee,
        shippingFee: defaultShippingFee,
        shippingAddress: shippingAddress.trim(),
        status: 'pending',
      });

      console.log('Order created:', order.id);

      // Tạo chi tiết đơn hàng và giảm số lượng sản phẩm
      for (const item of sellerItems) {
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          price: item.price,
          size: item.size || null, // Include size if provided
        });

        // Thêm thông tin sản phẩm tạm thời vào order object để dùng cho notification
        const product = await Product.findByPk(item.productId);
        if (!order.items) order.items = [];
        order.items.push({
          ...item,
          productName: product ? product.name : 'Sản phẩm'
        });

        console.log('Order item created:', item.productId, 'x', item.quantity, item.size ? `Size: ${item.size}` : '');

        // Giảm số lượng sản phẩm
        // product đã được lấy ở trên
        if (product) {
          await product.update({
            quantity: product.quantity - item.quantity,
            purchaseCount: (product.purchaseCount || 0) + item.quantity
          });
          console.log('Product quantity decreased:', product.name, 'New quantity:', product.quantity - item.quantity);
        }
      }

      orders.push(order);
    }

    console.log('=== ORDER CREATION SUCCESS ===');
    console.log('Total orders created:', orders.length);

    console.log('=== SENDING NOTIFICATIONS ===');
    // Gửi thông báo cho từng người bán
    for (const order of orders) {
      try {
        const productNames = order.items && order.items.length > 0
          ? order.items.map(item => item.productName || 'Sản phẩm').join(', ')
          : 'Sản phẩm';

        // Cắt ngắn nếu quá dài
        const displayProductNames = productNames.length > 50
          ? productNames.substring(0, 50) + '...'
          : productNames;

        const message = `Bạn có đơn hàng mới #${order.id} từ ${req.user.fullName || 'Khách hàng'}. Sản phẩm: ${displayProductNames}.`;

        await Notification.create({
          userId: order.sellerId,
          orderId: order.id,
          type: 'new_order',
          title: '📦 Bạn có đơn hàng mới!',
          message: message
        });
        console.log(`Notification sent to seller ${order.sellerId} for order ${order.id}`);
      } catch (notifError) {
        console.error('Failed to send notification:', notifError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: orders,
    });
  } catch (error) {
    console.error('=== ORDER CREATION ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Lấy danh sách đơn hàng của người mua
exports.getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const orders = await Order.findAll({
      where: { buyerId },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'fullName', 'email', 'phone'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'image', 'price'],
            },
          ],
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

// Lấy danh sách đơn hàng của người bán
exports.getMySalesOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const orders = await Order.findAll({
      where: { sellerId },
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'fullName', 'email', 'phone', 'address'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'image', 'price'],
            },
          ],
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

// Duyệt đơn hàng (người bán)
exports.approveOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const sellerId = req.user.id;

    const order = await Order.findOne({
      where: { id: orderId, sellerId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be approved',
      });
    }

    await order.update({ status: 'approved' });

    // Tạo thông báo cho người mua
    await Notification.create({
      userId: order.buyerId,
      orderId: order.id,
      type: 'order_approved',
      title: 'Đơn hàng đã được duyệt',
      message: `Đơn hàng #${order.id} của bạn đã được người bán duyệt và đang chờ shipper nhận.`,
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

// Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body; // Get cancellation reason
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
        message: 'You are not authorized to cancel this order',
      });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled',
      });
    }

    await order.update({ status: 'cancelled' });

    // Khôi phục số lượng sản phẩm
    const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
    for (const item of orderItems) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        await product.update({
          quantity: product.quantity + item.quantity,
          purchaseCount: Math.max(0, (product.purchaseCount || 0) - item.quantity)
        });
        console.log('Product quantity restored:', product.name, 'New quantity:', product.quantity + item.quantity);
      }
    }

    // Tạo thông báo kèm lý do
    const notificationUserId = order.buyerId === userId ? order.sellerId : order.buyerId;
    const cancelMessage = reason
      ? `Đơn hàng #${order.id} đã bị hủy. Lý do: ${reason}`
      : `Đơn hàng #${order.id} đã bị hủy.`;

    await Notification.create({
      userId: notificationUserId,
      orderId: order.id,
      type: 'order_cancelled',
      title: 'Đơn hàng đã bị hủy',
      message: cancelMessage,
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

// Lấy danh sách thông báo
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50,
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

// Đánh dấu thông báo đã đọc
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
// Lấy chi tiết đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'fullName', 'email', 'phone', 'address', 'avatar'],
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'fullName', 'email', 'phone', 'avatar'],
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'image', 'price'],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Kiểm tra quyền truy cập (chỉ người mua hoặc người bán mới được xem)
    if (order.buyerId !== userId && order.sellerId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
