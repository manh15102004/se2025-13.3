require('dotenv').config();
const { sequelize, User } = require('./models');

async function testLogin() {
    try {
        console.log('Testing login with pdm10a2@gmail.com...\n');

        // Find user
        const user = await User.findOne({ where: { email: 'pdm10a2@gmail.com' } });

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('✓ User found:', user.email);
        console.log('User ID:', user.id);
        console.log('Full Name:', user.fullName);
        console.log('Password hash (first 20 chars):', user.password.substring(0, 20) + '...');

        // Test password - you need to enter the password you used during registration
        const testPasswords = ['123456', 'Abc123', 'abc123', '0963788645'];

        console.log('\nTesting different passwords:');
        for (const pwd of testPasswords) {
            const isMatch = await user.matchPassword(pwd);
            console.log(`  Password "${pwd}": ${isMatch ? '✓ MATCH' : '✗ No match'}`);
        }

        console.log('\n--- Manual Test ---');
        console.log('Please enter the password you used during registration and test it manually.');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

testLogin();
