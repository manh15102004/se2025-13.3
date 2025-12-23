const { Product } = require('./models');

async function checkProducts() {
    try {
        const products = await Product.findAll({
            attributes: ['id', 'name', 'quantity', 'purchaseCount']
        });

        console.log('Product Status:');
        products.forEach(p => {
            console.log(`ID: ${p.id} | Name: ${p.name.padEnd(20)} | Qty: ${p.quantity} | Sold: ${p.purchaseCount}`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

checkProducts();
