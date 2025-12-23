const { sequelize } = require('./models');

async function addSizeColumn() {
    try {
        console.log('Adding size column to OrderItems...');
        await sequelize.query(`
      ALTER TABLE OrderItems 
      ADD COLUMN IF NOT EXISTS size VARCHAR(10) NULL AFTER price
    `);
        console.log('✅ Size column added to OrderItems');

        console.log('Adding size column to Carts...');
        await sequelize.query(`
      ALTER TABLE Carts 
      ADD COLUMN IF NOT EXISTS size VARCHAR(10) NULL AFTER price
    `);
        console.log('✅ Size column added to Carts');

        console.log('✅ Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

addSizeColumn();
