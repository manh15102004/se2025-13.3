const { sequelize, Shipment } = require('./models');

const syncShipment = async () => {
    try {
        console.log('Syncing Shipment model...');
        await Shipment.sync({ alter: true });
        console.log('Shipment synced.');
        process.exit(0);
    } catch (error) {
        console.error('Error syncing:', error);
        process.exit(1);
    }
};

syncShipment();
