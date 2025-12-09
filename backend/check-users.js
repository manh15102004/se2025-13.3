require('dotenv').config();
const { User } = require('./models');

async function checkUsers() {
    try {
        console.log('Checking all users in database...\n');

        const users = await User.findAll({
            attributes: ['id', 'email', 'fullName', 'phone', 'createdAt']
        });

        console.log(`Found ${users.length} user(s):\n`);

        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email}`);
            console.log(`   Name: ${user.fullName}`);
            console.log(`   Phone: ${user.phone || 'N/A'}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('');
        });

        if (users.length === 0) {
            console.log('No users found. Please register a new account.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }

    process.exit(0);
}

checkUsers();
