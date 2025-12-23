const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testOrder() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'buyer1@test.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');

        // 2. Get Order 3
        console.log('Fetching Order 3...');
        try {
            const orderRes = await axios.get(`${API_URL}/orders/3`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Order 3 Fetched Successfully!');
            console.log('Order Data:', JSON.stringify(orderRes.data.data, null, 2));
        } catch (err) {
            console.error('Fetch Order Failed:', err.response ? err.response.status : err.message);
            if (err.response) {
                console.error('Error Data:', err.response.data);
            }
        }
    } catch (error) {
        console.error('Test Failed:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
}

testOrder();
