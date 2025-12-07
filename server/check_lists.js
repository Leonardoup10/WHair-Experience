const axios = require('axios');

const endpoints = [
    'http://localhost:3001/professionals',
    'http://localhost:3001/services',
    'http://localhost:3001/products'
];

async function checkEndpoints() {
    for (const url of endpoints) {
        try {
            console.log(`Checking ${url}...`);
            const response = await axios.get(url);
            console.log(`Status: ${response.status}`);
            console.log(`Data count: ${Array.isArray(response.data) ? response.data.length : 'Not an array'}`);
            if (Array.isArray(response.data) && response.data.length > 0) {
                console.log('First item:', JSON.stringify(response.data[0], null, 2));
            }
            console.log('---');
        } catch (error) {
            console.error(`Error fetching ${url}:`, error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
            }
            console.log('---');
        }
    }
}

checkEndpoints();
