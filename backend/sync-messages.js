const { Message, Conversation, UserConversations, sequelize } = require('./models');

async function syncTables() {
    try {
        console.log('Syncing Messages...');
        await Message.sync({ alter: true });

        console.log('Syncing UserConversations...');
        // UserConversations might be accessed via sequelize.models.UserConversations
        // Check if it exists
        if (sequelize.models.UserConversations) {
            await sequelize.models.UserConversations.sync({ alter: true });
        }

        console.log('Sync complete.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

syncTables();
