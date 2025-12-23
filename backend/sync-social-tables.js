const { sequelize, Follow, ShopLike } = require('./models');

const syncTables = async () => {
    try {
        console.log('Syncing Follow table...');
        await Follow.sync({ force: true }); // Using force: true to ensure clean creation
        console.log('✅ Follow table synced.');

        console.log('Syncing ShopLike table...');
        await ShopLike.sync({ force: true });
        console.log('✅ ShopLike table synced.');

        console.log('All social tables synced successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Sync error:', error);
        process.exit(1);
    }
};

syncTables();
