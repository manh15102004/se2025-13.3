const { Sequelize } = require('sequelize');
const sequelize = require('./config/database');

async function diagnose() {
    try {
        await sequelize.authenticate();
        console.log('Connection successful.');

        const tables = await sequelize.getQueryInterface().showAllTables();
        console.log('Tables found:', JSON.stringify(tables, null, 2));

        for (const table of tables) {
            if (['Users', 'Conversations', 'UserConversations', 'UserConversation'].includes(table.tableName || table)) {
                const columns = await sequelize.getQueryInterface().describeTable(table);
                console.log(`\nTable: ${table}`);
                console.log(Object.keys(columns).join(', '));
            }
        }
    } catch (error) {
        console.error('Diagnosis Failed:', error);
    } finally {
        await sequelize.close();
    }
}

diagnose();
