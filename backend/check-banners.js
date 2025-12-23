const Banner = require('./models/Banner');
const sequelize = require('./config/database');

async function checkBanners() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const banners = await Banner.findAll();
        console.log('Total Banners:', banners.length);
        banners.forEach(b => {
            console.log(`ID: ${b.id} | Title: ${b.title} | Active: ${b.isActive} | Priority: ${b.priority} | Target: ${b.targetType}:${b.targetValue}`);
        });

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkBanners();
