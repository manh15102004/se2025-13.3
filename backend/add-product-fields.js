require('dotenv').config();
const { sequelize } = require('./models');

async function addProductFields() {
    try {
        console.log('Adding purchaseCount and isFeatured columns to Products table...\n');

        // Add purchaseCount column
        await sequelize.query(`
      ALTER TABLE Products 
      ADD COLUMN IF NOT EXISTS purchaseCount INT DEFAULT 0;
    `);

        // Add isFeatured column
        await sequelize.query(`
      ALTER TABLE Products 
      ADD COLUMN IF NOT EXISTS isFeatured TINYINT(1) DEFAULT 0;
    `);

        console.log('✓ Successfully added purchaseCount column');
        console.log('✓ Successfully added isFeatured column');
        console.log('\nProducts can now track purchase count and featured status.');

    } catch (error) {
        if (error.message.includes('Duplicate column')) {
            console.log('✓ Columns already exist');
        } else {
            console.error('❌ Error:', error.message);
        }
    }

    process.exit(0);
}

addProductFields();
