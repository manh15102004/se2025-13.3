const { Order, OrderItem, Product, User } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Lấy thống kê bán hàng
exports.getSellerAnalytics = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { period = 'week' } = req.query;

        // Tính toán khoảng thời gian
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'day':
                startDate.setDate(now.getDate() - 1);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        // Lấy thống kê doanh thu
        const orders = await Order.findAll({
            where: {
                sellerId,
                status: 'delivered', // Chỉ tính các đơn hàng đã giao thành công
                createdAt: { [Op.gte]: startDate }
            },
            include: [{
                model: OrderItem,
                as: 'items',
                include: [{
                    model: Product
                }]
            }]
        });

        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

        // Lấy tổng doanh thu toàn thời gian
        const allOrders = await Order.findAll({
            where: {
                sellerId,
                status: 'delivered'
            }
        });
        const allTimeRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

        // Lấy doanh thu tiềm năng (đang giao/đã duyệt)
        const potentialOrders = await Order.findAll({
            where: {
                sellerId,
                status: { [Op.in]: ['approved', 'shipping'] },
                createdAt: { [Op.gte]: startDate }
            }
        });
        const potentialRevenue = potentialOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

        // Lấy sản phẩm bán chạy nhất
        const topProducts = await OrderItem.findAll({
            attributes: [
                'productId',
                [sequelize.fn('SUM', sequelize.col('OrderItem.quantity')), 'totalQuantity'],
                [sequelize.fn('SUM', sequelize.literal('OrderItem.quantity * OrderItem.price')), 'totalRevenue']
            ],
            include: [{
                model: Product,
                where: { sellerId },
                attributes: ['id', 'name', 'image']
            }, {
                model: Order,
                where: {
                    status: 'delivered',
                    createdAt: { [Op.gte]: startDate }
                },
                attributes: []
            }],
            group: ['productId', 'Product.id', 'Product.name', 'Product.image'],
            order: [[sequelize.literal('totalRevenue'), 'DESC']],
            limit: 5,
            raw: true,
            nest: true
        });

        // Định dạng dữ liệu sản phẩm bán chạy
        const formattedTopProducts = topProducts.map(item => ({
            id: item.Product.id,
            name: item.Product.name,
            image: item.Product.image,
            quantity: parseInt(item.totalQuantity),
            revenue: parseFloat(item.totalRevenue)
        }));

        // Lấy thống kê khách hàng
        const uniqueCustomers = await Order.findAll({
            where: {
                sellerId,
                status: 'delivered'
            },
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('buyerId')), 'buyerId']],
            raw: true
        });

        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

        // Tạo dữ liệu biểu đồ
        const chartData = [];
        const daysCount = period === 'day' ? 24 : period === 'week' ? 7 : 30;

        for (let i = daysCount - 1; i >= 0; i--) {
            const date = new Date();
            if (period === 'day') {
                date.setHours(date.getHours() - i);
            } else {
                date.setDate(date.getDate() - i);
            }

            const periodOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                if (period === 'day') {
                    return orderDate.getHours() === date.getHours() &&
                        orderDate.getDate() === date.getDate();
                } else {
                    return orderDate.getDate() === date.getDate() &&
                        orderDate.getMonth() === date.getMonth();
                }
            });

            const periodRevenue = periodOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

            chartData.push({
                period: period === 'day' ? `${date.getHours()}h` : `${date.getDate()}/${date.getMonth() + 1}`,
                revenue: periodRevenue,
                orders: periodOrders.length
            });
        }

        res.json({
            success: true,
            data: {
                revenue: {
                    today: totalRevenue,
                    week: totalRevenue,
                    month: totalRevenue,
                    total: allTimeRevenue,
                    potential: potentialRevenue // Thêm doanh thu tiềm năng
                },
                chart: chartData,
                topProducts: formattedTopProducts,
                customers: {
                    total: uniqueCustomers.length,
                    new: 0,
                    returning: 0,
                    avgOrderValue
                }
            }
        });
    } catch (error) {
        console.error('Get seller analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = exports;
