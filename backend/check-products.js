require('dotenv').config();
const { Product, User } = require('./models');

async function checkProducts() {
    try {
        console.log('=== CHECKING PRODUCTS IN DATABASE ===\n');

        const products = await Product.findAll({
            include: [{
                model: User,
                as: 'seller',
                attributes: ['id', 'email', 'fullName']
            }],
            order: [['createdAt', 'DESC']]
        });

        if (products.length === 0) {
            console.log('❌ No products found in database');
            console.log('\nPossible reasons:');
            console.log('1. Products were not saved successfully');
            console.log('2. There was an error during product creation');
            console.log('3. Products are in a different database');
        } else {
            console.log(`✓ Found ${products.length} product(s):\n`);

            products.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   ID: ${product.id}`);
                console.log(`   Price: $${product.price}`);
                console.log(`   Category: ${product.category}`);
                console.log(`   Seller: ${product.seller?.fullName} (${product.seller?.email})`);
                console.log(`   Quantity: ${product.quantity || 0}`);
                console.log(`   Created: ${product.createdAt}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }

    process.exit(0);
}

checkProducts();
