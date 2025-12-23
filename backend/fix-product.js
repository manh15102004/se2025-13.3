const { Product } = require('./models');

async function fixProduct() {
    try {
        const product = await Product.findByPk(5);
        if (product) {
            // Since quantity went 66 -> 65, sold should be 1 (assuming 0 before)
            // Or just set to 1.
            await product.update({ purchaseCount: 1 });
            console.log('Updated Quần đùi purchaseCount to 1');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

fixProduct();
