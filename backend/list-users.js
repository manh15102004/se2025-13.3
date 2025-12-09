require('dotenv').config();
const { User } = require('./models');

async function listAllUsers() {
    try {
        console.log('=== DATABASE CONNECTION INFO ===');
        console.log(`Host: ${process.env.DB_HOST}`);
        console.log(`Database: ${process.env.DB_NAME}`);
        console.log(`User: ${process.env.DB_USER}`);
        console.log(`Port: ${process.env.DB_PORT}`);
        console.log('\n=== USERS IN DATABASE ===\n');

        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'fullName', 'phone', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        if (users.length === 0) {
            console.log('❌ No users found in database');
            console.log('\nPossible reasons:');
            console.log('1. You are looking at a different database');
            console.log('2. The database connection settings are different');
            console.log('3. Users were created in a different database instance');
        } else {
            console.log(`✓ Found ${users.length} user(s):\n`);

            users.forEach((user, index) => {
                console.log(`${index + 1}. ID: ${user.id}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Username: ${user.username || '(null)'}`);
                console.log(`   Full Name: ${user.fullName}`);
                console.log(`   Phone: ${user.phone || '(none)'}`);
                console.log(`   Created: ${user.createdAt}`);
                console.log('');
            });

            console.log('\n=== HOW TO VIEW IN MYSQL ===');
            console.log('Run this command in MySQL:');
            console.log(`USE ${process.env.DB_NAME};`);
            console.log('SELECT * FROM Users;');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nFull error:', error);
    }

    process.exit(0);
}

listAllUsers();
