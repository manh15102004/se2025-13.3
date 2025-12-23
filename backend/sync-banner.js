const Banner = require('./models/Banner');
const sequelize = require('./config/database');

async function syncBanner() {
    try {
        await sequelize.authenticate();
        console.log('Syncing Banner model...');
        await Banner.sync({ alter: true });
        console.log('Banner model synced successfully.');
    } catch (error) {
        console.error('Sync error:', error);
    } finally {
        await sequelize.close();
    }
}

syncBanner();
