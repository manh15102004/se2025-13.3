const { sequelize, Order, User } = require('./models');

async function verifyOrder() {
    try {
        const orderId = 3;
        console.log(`Checking Order ID: ${orderId}`);

        // Find plain
        const order = await Order.findByPk(orderId);
        if (!order) {
            console.log('Order NOT FOUND in standard findByPk');
        } else {
            console.log('Order FOUND:', JSON.stringify(order.toJSON(), null, 2));
        }

        // Find with associations (like controller)
        const orderWithAssoc = await Order.findByPk(orderId, {
            include: [
                { model: User, as: 'buyer', attributes: ['id', 'fullName'] },
                { model: User, as: 'seller', attributes: ['id', 'fullName'] }
            ]
        });

        if (!orderWithAssoc) {
            console.log('Order NOT FOUND when including associations');
        } else {
            console.log('Order FOUND with associations:', JSON.stringify(orderWithAssoc.toJSON(), null, 2));
        }

    } catch (error) {
        console.error('Error verifying order:', error);
    } finally {
        await sequelize.close();
    }
}

verifyOrder();
