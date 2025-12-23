require('dotenv').config();
const User = require('./models/User');
const sequelize = require('./config/database');

async function debugLogin() {
    try {
        console.log('🔍 Debugging login issue...\n');

        // Check if users exist
        const users = await User.findAll({
            attributes: ['id', 'email', 'username', 'fullName', 'role', 'password']
        });

        console.log(`Found ${users.length} users in database:\n`);

        if (users.length === 0) {
            console.log('❌ No users found! Need to create users first.');
            await sequelize.close();
            process.exit(1);
        }

        // Display users
        users.forEach(user => {
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`ID: ${user.id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Username: ${user.username}`);
            console.log(`Name: ${user.fullName}`);
            console.log(`Role: ${user.role}`);
            console.log(`Password Hash: ${user.password.substring(0, 30)}...`);
        });
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        // Test password matching for first user
        console.log('🧪 Testing password verification...\n');
        const testUser = users[0];
        const testPassword = '123456';

        console.log(`Testing login for: ${testUser.email}`);
        console.log(`Test password: ${testPassword}`);

        const isMatch = await testUser.matchPassword(testPassword);
        console.log(`Password match result: ${isMatch ? 'SUCCESS' : 'FAILED'}\n`);

        if (!isMatch) {
            console.log('Password verification failed!');
            console.log('This could mean:');
            console.log('1. Password was not hashed correctly during creation');
            console.log('2. matchPassword function has an issue');
            console.log('3. bcrypt comparison is failing\n');
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Full error:', error);
        await sequelize.close();
        process.exit(1);
    }
}

debugLogin();
