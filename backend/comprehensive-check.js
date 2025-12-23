const sequelize = require('./config/database');

async function comprehensiveCheck() {
    try {
        console.log('🔍 COMPREHENSIVE DATABASE CHECK\n');
        console.log('='.repeat(50));

        // 1. Check all tables
        const [tables] = await sequelize.query(`
      SELECT TABLE_NAME, TABLE_ROWS, 
             ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024), 2) AS size_kb
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      ORDER BY TABLE_NAME
    `);

        console.log('\n📊 DATABASE TABLES (' + tables.length + ' total)\n');
        tables.forEach(t => {
            const status = t.TABLE_ROWS > 0 ? '✅' : '⚪';
            console.log(`${status} ${t.TABLE_NAME.padEnd(25)} ${String(t.TABLE_ROWS).padStart(5)} rows  ${String(t.size_kb).padStart(8)} KB`);
        });

        // 2. Check for foreign key issues
        console.log('\n🔗 FOREIGN KEY CONSTRAINTS\n');
        const [fks] = await sequelize.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME
    `);
        console.log(`Found ${fks.length} foreign key constraints`);

        // 3. Check for orphaned records
        console.log('\n🔍 CHECKING FOR DATA INTEGRITY ISSUES\n');

        // Check products without sellers
        const [orphanProducts] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM Products p 
      LEFT JOIN Users u ON p.sellerId = u.id 
      WHERE u.id IS NULL
    `);
        console.log(`Products without valid seller: ${orphanProducts[0].count}`);

        // Check reviews without products
        const [orphanReviews] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM Reviews r 
      LEFT JOIN Products p ON r.productId = p.id 
      WHERE p.id IS NULL
    `);
        console.log(`Reviews without valid product: ${orphanReviews[0].count}`);

        // Check wishlists without products
        const [orphanWishlists] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM Wishlists w 
      LEFT JOIN Products p ON w.productId = p.id 
      WHERE p.id IS NULL
    `);
        console.log(`Wishlists without valid product: ${orphanWishlists[0].count}`);

        console.log('\n' + '='.repeat(50));
        console.log('✅ CHECK COMPLETE\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

comprehensiveCheck();
