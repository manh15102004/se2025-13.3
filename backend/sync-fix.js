const { sequelize } = require('./models');

async function syncFix() {
    try {
        // Check available models
        console.log('Available models:', Object.keys(sequelize.models));

        if (sequelize.models.UserConversation) {
            console.log('Syncing UserConversation...');
            await sequelize.models.UserConversation.sync({ alter: true });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

syncFix();
