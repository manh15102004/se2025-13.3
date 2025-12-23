const sequelize = require('./config/database');

async function addMissingColumns() {
    try {
        console.log('🔄 Checking and adding missing columns to Users table...');

        // Check if facebookId column exists
        const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'Users' 
        AND COLUMN_NAME = 'facebookId'
    `);

        if (columns.length === 0) {
            // Add facebookId column without UNIQUE constraint first
            await sequelize.query(`
        ALTER TABLE Users 
        ADD COLUMN facebookId VARCHAR(100) NULL 
        COMMENT 'Facebook user ID for OAuth login'
      `);
            console.log('✅ facebookId column added');
        } else {
            console.log('ℹ️  facebookId column already exists');
        }

        // Check if lastSeen column exists
        const [lastSeenColumns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'Users' 
        AND COLUMN_NAME = 'lastSeen'
    `);

        if (lastSeenColumns.length === 0) {
            // Add lastSeen column
            await sequelize.query(`
        ALTER TABLE Users 
        ADD COLUMN lastSeen DATETIME NULL DEFAULT CURRENT_TIMESTAMP 
        COMMENT 'Last time user was active, used for online/offline status'
      `);
            console.log('✅ lastSeen column added');
        } else {
            console.log('ℹ️  lastSeen column already exists');
        }

        // Verify the changes
        const [results] = await sequelize.query('DESCRIBE Users');
        console.log('\n📋 Current Users table structure:');
        console.table(results);

        console.log('\n✨ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

addMissingColumns();
