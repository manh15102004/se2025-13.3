require('dotenv').config();
const axios = require('axios');

async function testLogin() {
    try {
        console.log('🧪 Testing Login API Endpoint...\n');

        const testAccounts = [
            { email: 'buyer1@test.com', password: '123456', role: 'buyer' },
            { email: 'seller1@test.com', password: '123456', role: 'seller' },
            { email: 'shipper1@test.com', password: '123456', role: 'shipper' },
            { email: 'admin@test.com', password: '123456', role: 'admin' }
        ];

        const API_URL = 'http://localhost:5000/api/auth/login';

        for (const account of testAccounts) {
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`Testing: ${account.email} (${account.role})`);
            console.log(`Password: ${account.password}`);

            try {
                const response = await axios.post(API_URL, {
                    email: account.email,
                    password: account.password
                });

                if (response.data.success) {
                    console.log(`✅ LOGIN SUCCESS`);
                    console.log(`User: ${response.data.user.fullName}`);
                    console.log(`Role: ${response.data.user.role}`);
                    console.log(`Token: ${response.data.token.substring(0, 30)}...`);
                } else {
                    console.log(`❌ LOGIN FAILED: ${response.data.message}`);
                }
            } catch (error) {
                if (error.response) {
                    console.log(`❌ LOGIN FAILED: ${error.response.data.message}`);
                    console.log(`Status: ${error.response.status}`);
                } else {
                    console.log(`❌ ERROR: ${error.message}`);
                }
            }
            console.log('');
        }

        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        console.log('✅ Test completed!');

    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testLogin();
