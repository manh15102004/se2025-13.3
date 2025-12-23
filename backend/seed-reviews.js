const { Product, Review, User } = require('./models');
const sequelize = require('./config/database');

const seedReviews = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Get a test user (or create one if needed) to be the author of reviews
        let user = await User.findOne();
        if (!user) {
            user = await User.create({
                username: 'test_reviewer',
                email: 'reviewer@example.com',
                password: 'password',
                fullName: 'Test Reviewer'
            });
        }

        const products = await Product.findAll();
        console.log(`Found ${products.length} products.`);

        for (const product of products) {
            // Clear existing reviews for this product to avoid duplicates/mess
            await Review.destroy({ where: { productId: product.id } });

            // Generate 3-10 random reviews
            const numReviews = Math.floor(Math.random() * 8) + 3;
            let totalRating = 0;

            for (let i = 0; i < numReviews; i++) {
                const rating = Math.floor(Math.random() * 3) + 3; // 3 to 5 stars
                totalRating += rating;

                await Review.create({
                    productId: product.id,
                    userId: user.id,
                    rating: rating,
                    comment: `Sản phẩm tốt, review mẫu số ${i + 1}`
                });
            }

            const avgRating = (totalRating / numReviews).toFixed(1);

            // Update Product table to match
            await product.update({
                rating: avgRating,
                reviews: numReviews,
                isFeatured: avgRating >= 4.0
            });

            console.log(`Updated ${product.name}: ${numReviews} reviews, Avg ${avgRating}`);
        }

        console.log('Review seeding and sync completed!');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        process.exit();
    }
};

seedReviews();
