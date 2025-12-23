const { User, Product, Order, OrderItem, sequelize } = require('./models');

async function seedOrders() {
    try {
        console.log('🌱 Seeding Orders for Revenue/Analytics...');

        // 1. Get Users and Products
        const users = await User.findAll();
        const products = await Product.findAll();

        if (users.length === 0 || products.length === 0) {
            console.log('❌ No users or products found. Please seed them first.');
            return;
        }

        // We will focus on creating orders for currentUser (assumed to be user ID 2 based on logs) as Seller
        // so they can see Revenue stats.
        const sellerId = 2;
        const buyers = users.filter(u => u.id !== sellerId);

        // Statuses match model ENUM
        const statuses = ['delivered', 'delivered', 'shipping', 'approved', 'pending', 'cancelled'];

        // Force Sync to match Model Schema
        console.log('🔄 Recreating Order tables...');
        try {
            // Disable foreign key checks momentarily if needed, but usually force: true handles constraints by dropping
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
            await OrderItem.sync({ force: true });
            await Order.sync({ force: true });
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
            console.log('✅ Tables recreated');
        } catch (syncError) {
            console.log('⚠️ Could not force sync, trying to proceed...', syncError.message);
        }

        const orders = [];
        const orderItems = [];

        // Generate orders for the last 10 days
        const now = new Date();

        for (let i = 0; i < 20; i++) {
            // Random buyer
            const buyer = buyers[Math.floor(Math.random() * buyers.length)] || users[0];

            // Random date in last 10 days
            const date = new Date(now);
            date.setDate(date.getDate() - Math.floor(Math.random() * 10));
            date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

            // Random status
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            // Create Order
            const order = await Order.create({
                buyerId: buyer.id,
                sellerId: sellerId,
                totalAmount: 0, // FIXED: totalPrice -> totalAmount
                status: status,
                shippingAddress: '123 Test Street, Hanoi',
                paymentMethod: 'COD', // FIXED: uppercase
                paymentStatus: status === 'delivered' ? 'paid' : 'pending',
                createdAt: date,
                updatedAt: date
            });

            // Add items to order
            let orderTotal = 0;
            const itemCount = Math.floor(Math.random() * 3) + 1; // 1-3 items

            for (let j = 0; j < itemCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                const price = parseFloat(product.price);

                await OrderItem.create({
                    orderId: order.id,
                    productId: product.id,
                    quantity: quantity,
                    price: price,
                    size: 'M', // Mock size
                    createdAt: date,
                    updatedAt: date
                });

                orderTotal += price * quantity;
            }

            // Update Order Total
            order.totalAmount = orderTotal; // FIXED
            await order.save();

            console.log(`✅ Created Order #${order.id}: ${status} - ${orderTotal.toLocaleString()} đ - ${date.toISOString().split('T')[0]}`);
        }

        console.log('\n🎉 Revenue Data Restored Successfully!');
        process.exit(0);
    } catch (error) {
        if (error.errors) {
            error.errors.forEach(e => console.error(`❌ Validation Error: ${e.message} at ${e.path} value=${e.value}`));
        } else {
            console.error('❌ Error seeding orders:', error);
        }
        process.exit(1);
    }
}

seedOrders();
