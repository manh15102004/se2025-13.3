const { Product, sequelize } = require('./models');

async function boostRatings() {
    try {
        // Get 8 random products
        const products = await Product.findAll({
            limit: 8,
            order: sequelize.random()
        });

        console.log(`Found ${products.length} products to boost.`);

        for (const product of products) {
            const newRating = (Math.random() * (5.0 - 4.5) + 4.5).toFixed(1); // 4.5 to 5.0
            const newSales = Math.floor(Math.random() * 100) + 50; // 50 to 150 sales

            await product.update({
                rating: newRating,
                purchaseCount: newSales
            });
            console.log(`Updated ${product.name}: Rating -> ${newRating}, Sales -> ${newSales}`);
        }

        console.log('Done boosting ratings!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

boostRatings();
