const { sequelize } = require('./models');

async function checkShopTables() {
    try {
        console.log('Checking ShopLikes...');
        try {
            const [results] = await sequelize.query("DESCRIBE ShopLikes;");
            console.log('ShopLikes Columns:', results.map(r => r.Field).join(', '));
        } catch (e) {
            console.log('ShopLikes table ERROR:', e.message);
        }

        console.log('Checking Follows...');
        try {
            const [results2] = await sequelize.query("DESCRIBE Follows;");
            console.log('Follows Columns:', results2.map(r => r.Field).join(', '));
        } catch (e) {
            console.log('Follows table ERROR:', e.message);
        }

        // Also check User table for shop-related fields if any
        const [results3] = await sequelize.query("DESCRIBE Users;");
        console.log('Users Columns:', results3.map(r => r.Field).join(', '));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkShopTables();
