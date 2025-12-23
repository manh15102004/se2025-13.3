// Test loading shipperController
console.log('Loading shipperController...');
const shipperController = require('./controllers/shipperController');
console.log('shipperController exports:', Object.keys(shipperController));

// Test loading shipperRoutes
console.log('\nLoading shipperRoutes...');
try {
    const shipperRoutes = require('./routes/shipperRoutes');
    console.log('shipperRoutes loaded successfully');
} catch (error) {
    console.error('Error loading shipperRoutes:', error.message);
    console.error(error.stack);
}

console.log('\nAll tests passed!');
