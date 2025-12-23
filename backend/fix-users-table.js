require('dotenv').config();
const sequelize = require('./config/database');

async function fixUsersTable() {
    try {
        console.log('🔧 Starting Users table fix...');

        // Disable foreign key checks temporarily
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        console.log('✅ Disabled foreign key checks');

        // Drop the Users table completely
        await sequelize.query('DROP TABLE IF EXISTS `Users`;');
        console.log('✅ Dropped Users table');

        // Recreate the Users table with correct structure
        await sequelize.query(`
      CREATE TABLE \`Users\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`username\` VARCHAR(50) DEFAULT NULL,
        \`email\` VARCHAR(100) NOT NULL,
        \`password\` VARCHAR(255) NOT NULL,
        \`fullName\` VARCHAR(100) NOT NULL,
        \`phone\` VARCHAR(20) DEFAULT NULL,
        \`avatar\` LONGTEXT DEFAULT 'https://via.placeholder.com/150?text=User',
        \`address\` TEXT DEFAULT NULL,
        \`role\` ENUM('buyer', 'seller', 'shipper', 'admin') NOT NULL DEFAULT 'buyer',
        \`shippingFeePerOrder\` DECIMAL(10, 2) DEFAULT 20000.00 COMMENT 'Shipping fee that shipper earns per completed order',
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`username\` (\`username\`),
        UNIQUE KEY \`email\` (\`email\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
        console.log('✅ Created Users table with correct structure');

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('✅ Re-enabled foreign key checks');

        console.log('✅ Users table fix completed successfully!');
        console.log('⚠️  Note: You may need to recreate user accounts');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing Users table:', error.message);
        console.error('Full error:', error);

        // Try to re-enable foreign key checks even on error
        try {
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        } catch (e) {
            // Ignore
        }

        await sequelize.close();
        process.exit(1);
    }
}

fixUsersTable();
