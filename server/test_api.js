const axios = require('axios');

async function testAPI() {
    try {
        const response = await axios.get('http://localhost:3001/sales');
        console.log(`Total sales returned: ${response.data.length}`);
        console.log('\nFirst 3 sales:');
        console.log(JSON.stringify(response.data.slice(0, 3), null, 2));
        console.log('\nLast 3 sales:');
        console.log(JSON.stringify(response.data.slice(-3), null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testAPI();
