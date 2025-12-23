const { sequelize } = require('./models');
const Banner = require('./models/Banner');
const { Op } = require('sequelize');

const debugBanners = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        console.log('--- Current Server Time ---');
        console.log(new Date().toString());
        console.log('---------------------------');

        const allBanners = await Banner.findAll();
        console.log(`Found ${allBanners.length} total banners in DB:`);

        allBanners.forEach(b => {
            console.log(`[${b.id}] ${b.title}`);
            console.log(`    Status: ${b.isActive ? 'ACTIVE' : 'INACTIVE'}`);
            console.log(`    Start : ${b.startDate} (${typeof b.startDate})`);
            console.log(`    End   : ${b.endDate}`);
            console.log(`    Price : ${b.price}`);
        });

        console.log('\n--- Simulation: getBanners Query ---');
        const currentDate = new Date();
        const activeBanners = await Banner.findAll({
            where: {
                isActive: true,
                startDate: { [Op.lte]: currentDate },
                [Op.or]: [
                    { endDate: { [Op.gte]: currentDate } },
                    { endDate: null }
                ]
            }
        });
        console.log(`Query "getBanners" would return ${activeBanners.length} banners.`);
        activeBanners.forEach(b => console.log(` - Returned: [${b.id}] ${b.title}`));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
};

debugBanners();
