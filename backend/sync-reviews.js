const { Product, Review, sequelize } = require('./models');

async function syncReviews() {
    try {
        const products = await Product.findAll();
        console.log(`Syncing reviews for ${products.length} products...`);

        for (const product of products) {
            const avgRating = await Review.findOne({
                where: { productId: product.id },
                attributes: [
                    [Review.sequelize.fn('AVG', Review.sequelize.col('rating')), 'avgRating'],
                    [Review.sequelize.fn('COUNT', Review.sequelize.col('id')), 'countReviews'],
                ],
                raw: true,
            });

            const newRating = avgRating?.avgRating ? parseFloat(avgRating.avgRating).toFixed(1) : 0;
            const newReviews = avgRating?.countReviews ? parseInt(avgRating.countReviews) : 0;

            // Only update if changed
            if (parseFloat(product.rating) !== parseFloat(newRating) || product.reviews !== newReviews) {
                await product.update({
                    rating: newRating,
                    reviews: newReviews
                });
                console.log(`Updated [${product.id}] ${product.name}: Rating ${product.rating} -> ${newRating}, Reviews ${product.reviews} -> ${newReviews}`);
            }
        }

        console.log('Sync complete.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

syncReviews();
