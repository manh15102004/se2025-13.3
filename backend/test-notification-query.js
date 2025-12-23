const { sequelize } = require('./models');

async function testQuery() {
    try {
        console.log('Testing SELECT * FROM Notifications...');
        const [results] = await sequelize.query("SELECT * FROM Notifications LIMIT 1;");
        console.log('Query successful. Rows:', results.length);
        console.log('Schema is valid.');
    } catch (error) {
        console.error('Query failed:', error);
    } finally {
        await sequelize.close();
    }
}

testQuery();
