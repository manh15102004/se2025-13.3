const axios = require('axios');

async function testBackend() {
    try {
        console.log('Testing backend health...');
        const response = await axios.get('http://localhost:5000/api/health');
        console.log('✅ Backend is running:', response.data);

        console.log('\nTesting analytics endpoint...');
        const analyticsResponse = await axios.get('http://localhost:5000/api/analytics/seller', {
            headers: { Authorization: 'Bearer test' },
            params: { period: 'week' }
        });
        console.log('✅ Analytics endpoint accessible');
    } catch (error) {
        console.error('❌ Backend test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Backend is not running on port 5000!');
        }
    }
}

testBackend();
