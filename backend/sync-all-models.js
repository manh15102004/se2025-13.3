const sequelize = require('./config/database');
const fs = require('fs');
const path = require('path');

async function syncAllModels() {
    try {
        console.log('Syncing all models with database...\n');

        // Import all models
        const modelsPath = path.join(__dirname, 'models');
        const modelFiles = fs.readdirSync(modelsPath).filter(file =>
            file.endsWith('.js') && file !== 'index.js'
        );

        console.log('Found models:', modelFiles);
        console.log('\nSyncing database...');

        // Sync all models (alter: true will update existing tables without dropping them)
        await sequelize.sync({ alter: true });

        console.log('\n✅ All models synced successfully!');

        // Show all tables
        const [tables] = await sequelize.query(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);

        console.log('\n=== Database Tables ===');
        tables.forEach(row => {
            console.log(`${row.TABLE_NAME}: ${row.TABLE_ROWS} rows`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

syncAllModels();
