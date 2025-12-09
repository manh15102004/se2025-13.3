const { User, Product, Order, OrderItem, Shipment } = require('../models');

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
            const shipperId = req.user.id;
            const order = await Order.findOne({ where: { id: orderId, status: 'approved', shipperId: null } });
            if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

            await order.update({ shipperId, status: 'shipping' });
            const shipment = await Shipment.create({ orderId, shipperId, status: 'assigned', pickupTime: new Date() });
            res.status(200).json({ success: true, message: 'Order accepted', data: { order, shipment } });
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
            const shipment = await Shipment.findOne({ where: { orderId, shipperId: req.user.id } });
            if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

            await shipment.update({ status });
            if (status === 'in_transit') await Order.update({ status: 'shipping' }, { where: { id: orderId } });
            res.status(200).json({ success: true, message: 'Status updated', data: shipment });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    completeDelivery: async (req, res) => {
        try {
            const { orderId } = req.params;
            const { paymentConfirmed } = req.body;
            const order = await Order.findOne({ where: { id: orderId, shipperId: req.user.id } });
            if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

            await order.update({ status: 'delivered', paymentStatus: paymentConfirmed ? 'paid' : 'pending', deliveryDate: new Date() });
            await Shipment.update({ status: 'delivered', deliveryTime: new Date() }, { where: { orderId, shipperId: req.user.id } });

            const orderItems = await OrderItem.findAll({ where: { orderId } });
            for (const item of orderItems) {
                const product = await Product.findByPk(item.productId);
                if (product) {
                    const newQuantity = product.quantity - item.quantity;
                    await product.update({ quantity: newQuantity, status: newQuantity === 0 ? 'sold_out' : product.status });
                }
            }
            res.status(200).json({ success: true, message: 'Delivery completed', data: order });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    cancelDelivery: async (req, res) => {
        try {
            const { orderId } = req.params;
            const { reason } = req.body;
            const order = await Order.findOne({ where: { id: orderId, shipperId: req.user.id } });
            if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

            await order.update({ shipperId: null, status: 'approved' });
            await Shipment.update({ status: 'cancelled', cancelReason: reason, notes: `Cancelled: ${reason}` }, { where: { orderId, shipperId: req.user.id } });
            res.status(200).json({ success: true, message: 'Delivery cancelled' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
