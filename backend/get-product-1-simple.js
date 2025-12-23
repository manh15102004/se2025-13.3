const { Product } = require('./models');

async function getProduct1Seller() {
    try {
        const p = await Product.findByPk(1);
        if (p) {
            console.log('Product 1 SellerId:', p.sellerId);
            console.log('Product 1 Status:', p.status);
        } else {
            console.log('Product 1 not found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        require('./models').sequelize.close();
    }
}

getProduct1Seller();
