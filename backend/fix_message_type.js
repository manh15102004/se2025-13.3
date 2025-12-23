const sequelize = require('./config/database');
const { QueryTypes } = require('sequelize');

async function fixMessageType() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        const table = 'Messages';

        // Check if column exists
        const columns = await sequelize.getQueryInterface().describeTable(table);

        if (columns.type) {
            console.log('ℹ️ Column "type" already exists in Messages table.');
        } else {
            console.log('⚠️ Column "type" missing. Adding now...');
            await sequelize.getQueryInterface().addColumn(table, 'type', {
                type: 'VARCHAR(20)',
                defaultValue: 'text',
                allowNull: false
            });
            console.log('✅ Column "type" added successfully.');
        }

    } catch (error) {
        console.error('❌ Error fixing database:', error);
    } finally {
        await sequelize.close();
    }
}

fixMessageType();
