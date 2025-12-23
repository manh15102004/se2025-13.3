require('dotenv').config();
const { Product, User } = require('./models');

async function listAllProducts() {
    try {
        console.log('=== DETAILED PRODUCT CHECK ===\n');

        const products = await Product.findAll({
            include: [{
                model: User,
                as: 'seller',
                attributes: ['id', 'email', 'fullName']
            }],
            order: [['createdAt', 'DESC']]
        });

        console.log(`Total products in database: ${products.length}\n`);

        if (products.length === 0) {
            console.log('❌ NO PRODUCTS FOUND IN DATABASE');
            console.log('\nThis means:');
            console.log('1. Products were never created successfully');
            console.log('2. There was an error during product creation');
            console.log('3. Check backend logs when you try to create a product');
            console.log('\nTo create a product:');
            console.log('- Login to app');
            console.log('- Go to "Create Product" or "Đăng bán" screen');
            console.log('- Fill in product details');
            console.log('- Watch backend terminal for any errors');
        } else {
            products.forEach((product, index) => {
                console.log(`\n--- Product ${index + 1} ---`);
                console.log(`ID: ${product.id}`);
                console.log(`Name: ${product.name}`);
                console.log(`Price: ${product.price}`);
                console.log(`Category: ${product.category}`);
                console.log(`Quantity: ${product.quantity}`);
                console.log(`Rating: ${product.rating}`);
                console.log(`Reviews: ${product.reviews}`);
                console.log(`Image: ${product.image || '(no image)'}`);
                console.log(`Status: ${product.status}`);
                console.log(`Seller: ${product.seller?.fullName} (${product.seller?.email})`);
                console.log(`Created: ${product.createdAt}`);
            });

            console.log('\n=== SUMMARY ===');
            console.log(`✓ Found ${products.length} product(s) in database`);
            console.log('\nIf products don\'t show on HomeScreen:');
            console.log('1. Check React Native console for errors');
            console.log('2. Try reloading the app (shake device → Reload)');
            console.log('3. Check if API_BASE_URL is correct in client.ts');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
    }

    process.exit(0);
}

listAllProducts();
