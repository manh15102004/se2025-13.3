console.log('1. Loading models...');
const { sequelize } = require('./models');
console.log('✅ Models loaded');

console.log('\n2. Loading shipperController...');
const shipperController = require('./controllers/shipperController');
console.log('✅ shipperController:', Object.keys(shipperController));

console.log('\n3. Loading shipperRoutes...');
const shipperRoutes = require('./routes/shipperRoutes');
console.log('✅ shipperRoutes loaded');

console.log('\n4. Loading paymentController...');
const paymentController = require('./controllers/paymentController');
console.log('✅ paymentController loaded');

console.log('\n5. Loading paymentRoutes...');
const paymentRoutes = require('./routes/paymentRoutes');
console.log('✅ paymentRoutes loaded');

console.log('\n✅ ALL MODULES LOADED SUCCESSFULLY!');
