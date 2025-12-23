const { sequelize } = require('./models');

async function syncShopTables() {
    try {
        console.log('Syncing ShopLike...');
        if (sequelize.models.ShopLike) {
            await sequelize.models.ShopLike.sync({ alter: true });
        } else {
            console.log('Model ShopLike NOT FOUND in sequelize.models');
        }

        console.log('Syncing Follow...');
        if (sequelize.models.Follow) {
            await sequelize.models.Follow.sync({ alter: true });
        } else {
            console.log('Model Follow NOT FOUND in sequelize.models');
        }

        console.log('Sync complete.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

syncShopTables();
