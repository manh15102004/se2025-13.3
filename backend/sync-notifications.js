const { sequelize } = require('./models');

async function syncNotifications() {
    try {
        console.log('Syncing Notification model...');
        // Ensure Notification model is loaded via models/index.js (which requires sequelize)
        // We check sequelize.models
        if (sequelize.models.Notification) {
            await sequelize.models.Notification.sync({ alter: true });
            console.log('Sync complete.');
        } else {
            console.log('Notification model not found in sequelize instance!');
        }
    } catch (error) {
        console.error('Error syncing:', error);
    } finally {
        await sequelize.close();
    }
}

syncNotifications();
