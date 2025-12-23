const { Product } = require('./models');

async function getProduct1() {
    try {
        const p = await Product.findByPk(1);
        if (p) {
            console.log(JSON.stringify(p.toJSON(), null, 2));
        } else {
            console.log('Product 1 not found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        require('./models').sequelize.close();
    }
}

getProduct1();
