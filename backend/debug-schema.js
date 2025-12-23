const { sequelize } = require('./models');

async function checkSchema() {
    try {
        const [results] = await sequelize.query("DESCRIBE Messages;");
        console.log('Messages Columns:', results.map(r => r.Field).join(', '));

        const [results2] = await sequelize.query("DESCRIBE Conversations;");
        console.log('Conversations Columns:', results2.map(r => r.Field).join(', '));

        const [results3] = await sequelize.query("DESCRIBE UserConversations;");
        console.log('UserConversations Columns:', results3.map(r => r.Field).join(', '));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkSchema();
