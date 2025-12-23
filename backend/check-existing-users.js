require('dotenv').config();
const sequelize = require('./config/database');

async function checkDatabase() {
    try {
        console.log('🔍 Checking database for existing data...\n');

        // Check if Users table exists and has data
        const [users] = await sequelize.query('SELECT * FROM Users LIMIT 10;');

        if (users.length > 0) {
            console.log(`✅ Found ${users.length} users in database:`);
            console.log('━'.repeat(80));
            users.forEach(user => {
                console.log(`ID: ${user.id} | Email: ${user.email} | Role: ${user.role} | Name: ${user.fullName}`);
            });
            console.log('━'.repeat(80));
        } else {
            console.log('⚠️  Users table is empty. No existing accounts found.');
        }

        // Check total count
        const [countResult] = await sequelize.query('SELECT COUNT(*) as total FROM Users;');
        console.log(`\n📊 Total users in database: ${countResult[0].total}`);

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        await sequelize.close();
        process.exit(1);
    }
}

checkDatabase();
