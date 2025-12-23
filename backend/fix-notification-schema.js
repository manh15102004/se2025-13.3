const { sequelize } = require('./models');

async function fixNotificationSchema() {
    try {
        console.log('Checking Notifications table...');

        // Check columns
        const [results] = await sequelize.query("DESCRIBE Notifications;");
        const columns = results.map(r => r.Field);
        console.log('Current Columns:', columns.join(', '));

        if (!columns.includes('orderId') && !columns.includes('OrderId')) {
            console.log('Adding orderId column...');
            await sequelize.query("ALTER TABLE Notifications ADD COLUMN orderId INTEGER NULL;");
            console.log('Column added successfully.');
        } else {
            console.log('orderId column already exists.');
        }

        // Double check
        const [results2] = await sequelize.query("DESCRIBE Notifications;");
        console.log('New Columns:', results2.map(r => r.Field).join(', '));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixNotificationSchema();
