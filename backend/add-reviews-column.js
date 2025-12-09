require('dotenv').config();
const { sequelize } = require('./models');

async function addReviewsColumn() {
    try {
        console.log('Adding reviews column to Products table...\n');

        // Add reviews column
        await sequelize.query(`
      ALTER TABLE Products 
      ADD COLUMN IF NOT EXISTS reviews INT DEFAULT 0;
    `);

        console.log('✓ Successfully added reviews column to Products table');
        console.log('\nProducts can now track the number of reviews.');

    } catch (error) {
        if (error.message.includes('Duplicate column')) {
            console.log('✓ Reviews column already exists');
        } else {
            console.error('❌ Error:', error.message);
            console.error('\nTry running this SQL manually in MySQL:');
            console.error('ALTER TABLE Products ADD COLUMN reviews INT DEFAULT 0;');
        }
    }

    process.exit(0);
}

addReviewsColumn();
