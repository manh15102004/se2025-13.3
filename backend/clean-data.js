const { sequelize } = require('./models');

async function cleanData() {
    try {
        console.log('Cleaning data...');

        // Disable FK checks to allow truncation
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        console.log('Truncating OrderItems...');
        await sequelize.query('TRUNCATE TABLE `OrderItems`');

        console.log('Truncating Orders...');
        await sequelize.query('TRUNCATE TABLE `Orders`');

        console.log('Truncating CartItems...');
        // Check if CartItems exists (it should)
        await sequelize.query('TRUNCATE TABLE `CartItems`');

        // We can also truncate Carts if CartItems are linked to Carts
        console.log('Truncating Carts...');
        await sequelize.query('TRUNCATE TABLE `Carts`');

        console.log('Truncating Reviews...');
        await sequelize.query('TRUNCATE TABLE `Reviews`');

        console.log('Truncating Wishlists...');
        await sequelize.query('TRUNCATE TABLE `Wishlists`');

        console.log('Truncating Notifications...');
        await sequelize.query('TRUNCATE TABLE `Notifications`');

        console.log('Truncating Products...');
        await sequelize.query('TRUNCATE TABLE `Products`');

        // Re-enable FK checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Data cleaned successfully (Users preserved).');

    } catch (error) {
        console.error('Error cleaning data:', error);
    } finally {
        await sequelize.close();
    }
}

cleanData();
