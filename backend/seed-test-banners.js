const Banner = require('./models/Banner');
const sequelize = require('./config/database');

async function seedBanner() {
    try {
        await sequelize.authenticate();
        console.log('Seeding banner...');

        // Delete existing banners to avoid clutter
        await Banner.destroy({ where: {} });

        // Create an active banner
        await Banner.create({
            image: '🎮',
            title: 'Gaming Gear Sale',
            subtitle: 'Up to 50% off on all accessories',
            targetType: 'category',
            targetValue: 'Electronics',
            isActive: true, // Force active for immediate visibility
            priority: 10
        });

        // Create a pending banner (to test approval flow if they want)
        await Banner.create({
            image: '👗',
            title: 'Summer Fashion',
            subtitle: 'New arrivals',
            targetType: 'category',
            targetValue: 'Fashion',
            isActive: false,
            priority: 5
        });

        console.log('Banners seeded successfully.');
    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await sequelize.close();
    }
}

seedBanner();
