const { Order, OrderItem, Product, User, Shipment, Notification } = require('../models');

module.exports = {
    getAvailableOrders: async (req, res) => {
        try {
            const orders = await Order.findAll({
                where: { status: 'approved', shipperId: null },
                include: [
                    { model: User, as: 'buyer', attributes: ['id', 'fullName', 'phone', 'address'] },
                    { model: OrderItem, as: 'items', include: [{ model: Product }] }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    acceptOrder: async (req, res) => {
        try {
            const { orderId } = req.params;
            const order = await Order.findByPk(orderId);
            if (!order || order.status !== 'approved') {
                return res.status(404).json({ success: false, message: 'Order not available' });
            }

            await order.update({ shipperId: req.user.id, status: 'shipping' });
            await Shipment.create({ orderId: order.id, shipperId: req.user.id, status: 'picked_up' });

            // Tạo thông báo cho người mua
            await Notification.create({
                userId: order.buyerId,
                orderId: order.id,
                type: 'order_picked_up',
                title: 'Shipper đang lấy hàng',
                message: `Đơn hàng #${order.id} của bạn đang được shipper lấy hàng. Sẽ sớm được giao đến bạn!`
            });

            res.status(200).json({ success: true, message: 'Order accepted', data: order });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getMyDeliveries: async (req, res) => {
        try {
            const orders = await Order.findAll({
                where: { shipperId: req.user.id },
                include: [
                    { model: User, as: 'buyer', attributes: ['id', 'fullName', 'phone', 'address'] },
                    { model: OrderItem, as: 'items', include: [{ model: Product }] },
                    { model: Shipment, where: { shipperId: req.user.id }, required: false }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json({ success: true, data: orders });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateDeliveryStatus: async (req, res) => {
        try {
            const { orderId } = req.params;
            const { status } = req.body;

            const order = await Order.findOne({ where: { id: orderId, shipperId: req.user.id } });
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            const shipment = await Shipment.findOne({ where: { orderId, shipperId: req.user.id } });
            if (!shipment) {
                return res.status(404).json({ success: false, message: 'Shipment not found' });
            }

            await shipment.update({ status });

            // Tạo thông báo cho người mua khi trạng thái là đang giao
            if (status === 'in_transit') {
                await Notification.create({
                    userId: order.buyerId,
                    orderId: order.id,
                    type: 'order_in_transit',
                    title: 'Đơn hàng đang được giao',
                    message: `Đơn hàng #${order.id} đang trên đường giao đến bạn!`
                });
            }

            res.status(200).json({ success: true, message: 'Status updated', data: shipment });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    completeDelivery: async (req, res) => {
        try {
            const { orderId } = req.params;
            const { paymentConfirmed } = req.body;

            console.log('=== COMPLETE DELIVERY ===');
            console.log('Order ID:', orderId);
            console.log('Shipper ID:', req.user.id);

            const order = await Order.findOne({ where: { id: orderId, shipperId: req.user.id } });
            if (!order) {
                console.error('Order not found');
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            console.log('Order found:', { buyerId: order.buyerId, sellerId: order.sellerId });

            const shipment = await Shipment.findOne({ where: { orderId, shipperId: req.user.id } });
            if (!shipment) {
                console.error('Shipment not found');
                return res.status(404).json({ success: false, message: 'Shipment not found' });
            }

            // Cập nhật trạng thái đơn hàng và vận chuyển
            await order.update({
                status: 'delivered',
                paymentStatus: paymentConfirmed ? 'paid' : 'pending',
                deliveryDate: new Date()
            });
            await shipment.update({ status: 'delivered', deliveryTime: new Date() });

            console.log('Order and shipment updated');

            // LƯU Ý: Tồn kho đã giảm khi tạo đơn hàng
            // Không cần giảm lại khi giao hàng

            // Tạo thông báo cho người mua
            await Notification.create({
                userId: order.buyerId,
                orderId: order.id,
                type: 'order_delivered',
                title: 'Đơn hàng đã giao thành công',
                message: `Đơn hàng #${order.id} đã được giao thành công! Cảm ơn bạn đã mua hàng.`
            });

            console.log('Buyer notification created');

            // Tạo thông báo cho người bán
            await Notification.create({
                userId: order.sellerId,
                orderId: order.id,
                type: 'order_delivered',
                title: 'Đơn hàng đã được giao',
                message: `Đơn hàng #${order.id} đã được shipper giao thành công đến khách hàng.`
            });

            console.log('Seller notification created');
            console.log('✅ Delivery completed successfully');

            res.status(200).json({ success: true, message: 'Delivery completed', data: order });
        } catch (error) {
            console.error('=== COMPLETE DELIVERY ERROR ===');
            console.error('Error:', error.message);
            res.status(500).json({ success: false, message: error.message });
        }
    },

    cancelDelivery: async (req, res) => {
        try {
            const { orderId } = req.params;
            const { reason } = req.body;

            const order = await Order.findOne({ where: { id: orderId, shipperId: req.user.id } });
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            await order.update({ shipperId: null, status: 'approved' });
            await Shipment.update(
                { status: 'cancelled', cancelReason: reason, notes: `Cancelled: ${reason}` },
                { where: { orderId, shipperId: req.user.id } }
            );

            // Tạo thông báo cho người mua
            await Notification.create({
                userId: order.buyerId,
                orderId: order.id,
                type: 'order_cancelled',
                title: 'Shipper đã hủy đơn',
                message: `Đơn hàng #${order.id} đã bị shipper hủy. Lý do: ${reason || 'Không rõ'}`
            });

            res.status(200).json({ success: true, message: 'Delivery cancelled' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
