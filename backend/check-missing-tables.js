const sequelize = require('./config/database');

async function checkMissingTables() {
    try {
        // Expected tables from models
        const expectedTables = [
            'addresses', 'banners', 'carts', 'cartitems', 'categories',
            'conversations', 'conversationparticipants', 'follows',
            'likes', 'messages', 'notifications', 'orders', 'orderitems',
            'payments', 'productimages', 'products', 'reviews', 'shipments',
            'userconversations', 'users', 'vouchers', 'wishlists'
        ];

        // Get actual tables
        const [tables] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);

        const actualTables = tables.map(t => t.TABLE_NAME.toLowerCase());

        console.log('=== Table Check ===\n');
        console.log('Expected tables:', expectedTables.length);
        console.log('Actual tables:', actualTables.length);
        console.log('\nMissing tables:');

        const missing = expectedTables.filter(t => !actualTables.includes(t));
        if (missing.length === 0) {
            console.log('✅ None - All tables exist!');
        } else {
            missing.forEach(t => console.log(`❌ ${t}`));
        }

        console.log('\nExtra tables (not in models):');
        const extra = actualTables.filter(t => !expectedTables.includes(t));
        if (extra.length === 0) {
            console.log('✅ None');
        } else {
            extra.forEach(t => console.log(`⚠️  ${t}`));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkMissingTables();
