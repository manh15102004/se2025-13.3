const { sequelize } = require('./models');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        const adminEmail = 'admin@appsale.com';
        const adminPassword = 'admin123'; // In production, use strong password

        // Check if admin exists
        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log('⚠️ Admin account already exists:', adminEmail);
            // Update role just in case
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Updated user role to admin');
            }
        } else {
            await User.create({
                fullName: 'System Administrator',
                email: adminEmail,
                password: adminPassword,
                phone: '0909000000',
                role: 'admin', // Key role
            });
            console.log('🎉 Admin account created successfully!');
            console.log('📧 Email:', adminEmail);
            console.log('🔑 Password:', adminPassword);
        }
    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        await sequelize.close();
    }
};

createAdmin();
