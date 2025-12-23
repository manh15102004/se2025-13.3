const { Review, Product, sequelize } = require('./models');

async function mockReviews() {
    try {
        const userId = 1; // Assuming main user is ID 1
        const products = await Product.findAll({ limit: 10 }); // Get candidates

        let addedCount = 0;
        for (const product of products) {
            if (addedCount >= 5) break;

            const [review, created] = await Review.findOrCreate({
                where: { userId, productId: product.id },
                defaults: {
                    rating: 5,
                    comment: 'Sản phẩm tuyệt vời! Đáng tiền.',
                }
            });

            if (created) {
                console.log(`Created review for [${product.id}] ${product.name}`);
                addedCount++;

                // Sync rating immediately
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

                await product.update({ rating: newRating, reviews: newReviews });
            } else {
                // If already reviewed, update to 5 stars
                await review.update({ rating: 5 });

                // Sync rating immediately
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
                await product.update({ rating: newRating, reviews: newReviews });

                console.log(`Updated existing review for [${product.id}] ${product.name} to 5 stars`);
                addedCount++;
            }
        }
        console.log('Mock reviews done.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

mockReviews();
