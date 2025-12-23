const { User } = require('./models');

async function checkAdminUsers() {
    try {
        const users = await User.findAll({
            attributes: ['id', 'email', 'fullName', 'role']
        });

        console.log('\n=== All Users ===');
        users.forEach(user => {
            console.log(`${user.id}. ${user.fullName} (${user.email}) - Role: ${user.role}`);
        });

        const admins = users.filter(u => u.role === 'admin');
        console.log(`\n=== Admin Users: ${admins.length} ===`);
        admins.forEach(admin => {
            console.log(`- ${admin.fullName} (${admin.email})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAdminUsers();
