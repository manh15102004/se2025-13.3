const { User } = require('./models');

async function setUserOffline() {
    try {
        const userId = process.argv[2];

        if (!userId) {
            console.log('Usage: node set-user-offline.js <userId>');
            console.log('Example: node set-user-offline.js 2');
            process.exit(1);
        }

        const user = await User.findByPk(userId);

        if (!user) {
            console.log(`User with ID ${userId} not found`);
            process.exit(1);
        }

        // Set lastSeen to 1 hour ago
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        await user.update({ lastSeen: oneHourAgo });

        console.log(`✅ Set ${user.fullName} (ID: ${userId}) offline`);
        console.log(`   lastSeen: ${oneHourAgo}`);
        console.log(`   Status: Offline 1 giờ trước`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

setUserOffline();
