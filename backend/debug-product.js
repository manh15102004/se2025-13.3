const { Product } = require('./models');
const { Op } = require('sequelize');

async function check() {
    try {
        console.log('Searching for "Doreamon"...');
        const products = await Product.findAll({
            where: {
                name: { [Op.like]: '%Doreamon%' }
            }
        });

        if (products.length === 0) {
            console.log('No product found with name like "Doreamon"');
        } else {
            products.forEach(p => {
                console.log(`Found: ID=${p.id}, Name="${p.name}", Price=${p.price} (${typeof p.price}), Quantity=${p.quantity}`);
            });
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

check();
