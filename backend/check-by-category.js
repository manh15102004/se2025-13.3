require('dotenv').config();
const { Product, User } = require('./models');

async function checkProductsByCategory() {
    try {
        console.log('=== CHECKING PRODUCTS BY CATEGORY ===\n');

        // Get all products
        const allProducts = await Product.findAll({
            include: [{
                model: User,
                as: 'seller',
                attributes: ['email', 'fullName']
            }]
        });

        console.log(`Total products: ${allProducts.length}\n`);

        // Group by category
        const byCategory = {};
        allProducts.forEach(p => {
            if (!byCategory[p.category]) {
                byCategory[p.category] = [];
            }
            byCategory[p.category].push(p);
        });

        console.log('Products by category:\n');
        Object.keys(byCategory).forEach(cat => {
            console.log(`${cat}: ${byCategory[cat].length} product(s)`);
            byCategory[cat].forEach(p => {
                console.log(`  - ${p.name} (Price: ${p.price}, Qty: ${p.quantity})`);
                console.log(`    Seller: ${p.seller?.email}`);
            });
            console.log('');
        });

        // Check specifically for "Quần áo"
        const quanAo = await Product.findAll({
            where: { category: 'Quần áo' },
            include: [{
                model: User,
                as: 'seller',
                attributes: ['email', 'fullName']
            }]
        });

        console.log(`\n=== QUẦN ÁO CATEGORY ===`);
        console.log(`Found ${quanAo.length} product(s) in "Quần áo" category\n`);

        if (quanAo.length > 0) {
            quanAo.forEach((p, i) => {
                console.log(`${i + 1}. ${p.name}`);
                console.log(`   Price: $${p.price}`);
                console.log(`   Quantity: ${p.quantity}`);
                console.log(`   Rating: ${p.rating}`);
                console.log(`   Reviews: ${p.reviews}`);
                console.log(`   Image: ${p.image || '(no image)'}`);
                console.log(`   Seller: ${p.seller?.fullName} (${p.seller?.email})`);
                console.log('');
            });
        } else {
            console.log('❌ No products found in "Quần áo" category');
            console.log('\nPossible reasons:');
            console.log('1. Product was created with different category name');
            console.log('2. Product creation failed');
            console.log('3. Category name has typo or different encoding');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }

    process.exit(0);
}

checkProductsByCategory();
