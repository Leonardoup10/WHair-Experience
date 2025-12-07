const axios = require('axios');

async function testApi() {
    try {
        console.log('Fetching /sales...');
        const res = await axios.get('http://localhost:3001/sales');
        console.log(`Status: ${res.status}`);
        console.log(`Data Length: ${res.data.length}`);
        if (res.data.length > 0) {
            console.log('Sample:', res.data[0]);
        }
    } catch (error) {
        console.error('Error fetching API:', error.message);
    }
}

testApi();
