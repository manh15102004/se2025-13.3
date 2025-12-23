require('dotenv').config();
const { Order, OrderItem, Product, User } = require('./models');

async function checkOrders() {
    try {
        console.log('=== CHECKING ORDERS IN DATABASE ===\n');

        const orders = await Order.findAll({
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [{ model: Product }]
                },
                {
                    model: User,
                    as: 'buyer',
                    attributes: ['id', 'email', 'fullName']
                },
                {
                    model: User,
                    as: 'seller',
                    attributes: ['id', 'email', 'fullName']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log(`Total orders: ${orders.length}\n`);

        if (orders.length === 0) {
            console.log('❌ NO ORDERS FOUND');
            console.log('\nThis means:');
            console.log('1. No orders have been created yet');
            console.log('2. handleBuyNow is not calling orderAPI.createOrder');
            console.log('3. There was an error during order creation');
        } else {
            orders.forEach((order, index) => {
                console.log(`\n--- Order ${index + 1} ---`);
                console.log(`ID: ${order.id}`);
                console.log(`Buyer: ${order.buyer?.fullName} (${order.buyer?.email})`);
                console.log(`Seller: ${order.seller?.fullName} (${order.seller?.email})`);
                console.log(`Total: $${order.totalPrice}`);
                console.log(`Status: ${order.status}`);
                console.log(`Items: ${order.items?.length || 0}`);
                order.items?.forEach((item, i) => {
                    console.log(`  ${i + 1}. ${item.Product?.name} x${item.quantity} @ $${item.price}`);
                });
                console.log(`Created: ${order.createdAt}`);
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
        console.error(error);
    }

    process.exit(0);
}

checkOrders();
