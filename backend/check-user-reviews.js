const { Review, User, Product, sequelize } = require('./models');

async function checkUserReviews() {
    try {
        const reviews = await Review.findAll({
            include: [
                { model: User, as: 'user', attributes: ['id', 'fullName'] },
                { model: Product, attributes: ['id', 'name'] }
            ],
            order: [['userId', 'ASC']]
        });

        console.log(`Total Reviews: ${reviews.length}`);
        reviews.forEach(r => {
            console.log(`User [${r.userId}] ${r.user?.fullName} reviewed Product [${r.productId}] ${r.Product?.name}: ${r.rating} stars`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkUserReviews();
