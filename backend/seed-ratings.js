const { Product } = require('./models');
const sequelize = require('./config/database');

const seedRatings = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Update ALL products to have random ratings between 3.5 and 5.0 for testing
        const products = await Product.findAll();
        console.log(`Found ${products.length} products.`);

        for (const product of products) {
            // Random rating between 3.0 and 5.0
            const randomRating = (Math.random() * (5.0 - 3.0) + 3.0).toFixed(1);
            // Random reviews count
            const randomReviews = Math.floor(Math.random() * 100);

            await product.update({
                rating: randomRating,
                reviews: randomReviews,
                isFeatured: randomRating >= 4.5 // Mark really good ones as featured
            });
            console.log(`Updated ${product.name}: Rating ${randomRating}, Reviews ${randomReviews}`);
        }

        console.log('Seeding completed!');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        process.exit();
    }
};

seedRatings();
