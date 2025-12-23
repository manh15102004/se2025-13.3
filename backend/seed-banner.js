const { sequelize } = require('./models');
const Banner = require('./models/Banner');

async function seedBanner() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Create a sample banner
        const banner = await Banner.create({
            title: 'Chào mừng bạn mới!',
            subtitle: 'Giảm giá 50% cho đơn hàng đầu tiên',
            image: '🎉',
            priority: 10,
            isActive: true,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 30)) // Valid for 30 days
        });

        console.log('✅ Sample banner created:', banner.toJSON());
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding banner:', error);
        process.exit(1);
    }
}

seedBanner();
