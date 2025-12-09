require('dotenv').config();
const { sequelize } = require('./models');

async function fixUsernameColumn() {
    try {
        console.log('Fixing username column to allow NULL...\n');

        // Alter the username column to allow NULL
        await sequelize.query(`
      ALTER TABLE Users 
      MODIFY COLUMN username VARCHAR(50) NULL DEFAULT NULL;
    `);

        console.log('✓ Successfully modified username column to allow NULL');
        console.log('\nYou can now register users without providing a username.');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nIf you see "column doesn\'t exist" error, the column might have a different name.');
        console.error('Try running this SQL manually in MySQL:');
        console.error('ALTER TABLE Users MODIFY COLUMN username VARCHAR(50) NULL DEFAULT NULL;');
    }

    process.exit(0);
}

fixUsernameColumn();
