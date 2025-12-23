// Test script to check if Wishlist model loads correctly
require('dotenv').config();

console.log('Testing Wishlist model...');

try {
    const { Wishlist, sequelize } = require('./models');
    console.log('✅ Wishlist model loaded successfully');
    console.log('Wishlist:', Wishlist);

    sequelize.authenticate()
        .then(() => {
            console.log('✅ Database connection successful');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Database connection failed:', err.message);
            process.exit(1);
        });
} catch (error) {
    console.error('❌ Error loading Wishlist model:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
}
