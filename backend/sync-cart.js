const { sequelize, Cart } = require('./models');

async function syncCart() {
    try {
        console.log('Syncing Cart table...');
        await Cart.sync({ alter: true });
        console.log('Cart table synced successfully.');

        // Verify columns
        const [results] = await sequelize.query('DESCRIBE `Carts`;');
        console.log('Columns:', results.map(c => c.Field).join(', '));

    } catch (error) {
        console.error('Error syncing Cart:', error);
    } finally {
        sequelize.close();
    }
}

syncCart();
