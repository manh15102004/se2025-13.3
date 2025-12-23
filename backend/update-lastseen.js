const { User } = require('./models');

async function updateAllUsersLastSeen() {
    try {
        console.log('Updating lastSeen for all users...');

        const result = await User.update(
            { lastSeen: new Date() },
            { where: {} } // Update all users
        );

        console.log(`Updated ${result[0]} users with current timestamp`);

        // Verify
        const users = await User.findAll({
            attributes: ['id', 'fullName', 'lastSeen']
        });

        console.log('\nUsers with lastSeen:');
        users.forEach(user => {
            console.log(`- ${user.fullName}: ${user.lastSeen}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

updateAllUsersLastSeen();
