const { User, Order, Shipment } = require('../models');
const { Op } = require('sequelize');

// Lấy thống kê người giao hàng
exports.getShipperStats = async (req, res) => {
    try {
        const shipperId = req.user.id;

        // Lấy tất cả đơn hàng giao của shipper này
        const allDeliveries = await Order.findAll({
            where: { shipperId },
            include: [{ model: Shipment, where: { shipperId }, required: false }]
        });

        // Tính toán thống kê
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Tổng đơn hàng đã hoàn thành
        const completedOrders = allDeliveries.filter(o => o.status === 'delivered');
        const totalOrders = completedOrders.length;

        // Đơn hàng đang giao
        const activeDeliveries = allDeliveries.filter(o => o.status === 'shipping').length;

        // Đơn hàng hôm nay (nhận hôm nay)
        const todayOrders = allDeliveries.filter(o => {
            const orderDate = new Date(o.updatedAt);
            return orderDate >= today && orderDate < tomorrow;
        }).length;

        // Thu nhập hôm nay (hoàn thành hôm nay)
        const todayEarnings = allDeliveries
            .filter(o => {
                if (o.status !== 'delivered') return false;
                const completedDate = new Date(o.updatedAt);
                return completedDate >= today && completedDate < tomorrow;
            })
            .reduce((sum, o) => sum + (parseFloat(o.shippingFee) || 20000), 0);

        // Tổng thu nhập (tất cả đơn hàng đã hoàn thành)
        const totalEarnings = completedOrders
            .reduce((sum, o) => sum + (parseFloat(o.shippingFee) || 20000), 0);

        res.status(200).json({
            success: true,
            data: {
                totalOrders,
                activeDeliveries,
                todayOrders,
                todayEarnings,
                totalEarnings,
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy lịch sử thu nhập của shipper
exports.getShipperEarnings = async (req, res) => {
    try {
        const shipperId = req.user.id;
        const { period = 'month' } = req.query; // day, week, month

        const completedOrders = await Order.findAll({
            where: {
                shipperId,
                status: 'delivered'
            },
            order: [['updatedAt', 'DESC']],
            limit: period === 'day' ? 30 : period === 'week' ? 12 : 12
        });

        const earnings = completedOrders.map(order => ({
            orderId: order.id,
            date: order.updatedAt,
            amount: parseFloat(order.shippingFee) || 20000,
            totalPrice: order.totalPrice
        }));

        const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

        res.status(200).json({
            success: true,
            data: {
                earnings,
                totalEarnings,
                count: earnings.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getShipperStats: exports.getShipperStats,
    getShipperEarnings: exports.getShipperEarnings
};
