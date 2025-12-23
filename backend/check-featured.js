const { Product, sequelize } = require('./models');

async function checkProducts() {
    try {
        const total = await Product.count();
        console.log(`Total products: ${total}`);

        const featured = await Product.findAll({
            where: {
                status: 'active',
                rating: { [require('sequelize').Op.gte]: 4.5 }
            },
            attributes: ['id', 'name', 'rating', 'purchaseCount'],
            order: [['rating', 'DESC']]
        });

        console.log(`Products with Rating >= 4.5: ${featured.length}`);
        featured.forEach(p => {
            console.log(`- [${p.id}] ${p.name}: Rating ${p.rating}, Sales ${p.purchaseCount}`);
        });

        const nearMisses = await Product.findAll({
            where: {
                status: 'active',
                rating: { [require('sequelize').Op.between]: [4.0, 4.49] }
            },
            attributes: ['id', 'name', 'rating'],
            limit: 5
        });
        console.log(`\nProducts with Rating 4.0 - 4.49 (Near misses): ${nearMisses.length}`);
        nearMisses.forEach(p => {
            console.log(`- [${p.id}] ${p.name}: Rating ${p.rating}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkProducts();
