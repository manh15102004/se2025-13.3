require('dotenv').config();
const { sequelize, User } = require('./models');

async function testDatabase() {
    try {
        console.log('Testing database connection...');
        await sequelize.authenticate();
        console.log('✓ Database connection successful');

        console.log('\nSyncing database...');
        await sequelize.sync();
        console.log('✓ Database synced');

        console.log('\nChecking existing users...');
        const users = await User.findAll();
        console.log(`Found ${users.length} users`);
        users.forEach(user => {
            console.log(`  - ${user.email} (${user.fullName})`);
        });

        console.log('\nCreating test user...');
        try {
            const testUser = await User.create({
                email: 'test@test.com',
                password: '123456',
                fullName: 'Test User',
            });
            console.log('✓ Test user created:', testUser.email);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                console.log('Test user already exists');

                // Try to login
                const user = await User.findOne({ where: { email: 'test@test.com' } });
                if (user) {
                    const isMatch = await user.matchPassword('123456');
                    console.log('Password match test:', isMatch);
                }
            } else {
                throw error;
            }
        }

        console.log('\n✓ All tests passed!');
    } catch (error) {
        console.error('✗ Error:', error.message);
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

testDatabase();
