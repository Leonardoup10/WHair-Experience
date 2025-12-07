const axios = require('axios');

async function testProfs() {
    try {
        console.log('Fetching /professionals...');
        const res = await axios.get('http://localhost:3001/professionals');
        console.log(`Status: ${res.status}`);
        console.log(`Data Length: ${res.data.length}`);
        if (res.data.length > 0) {
            console.log('Sample:', res.data[0]);
        }
    } catch (error) {
        console.error('Error fetching API:', error.message);
    }
}

testProfs();
