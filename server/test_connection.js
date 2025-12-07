
const axios = require('axios');
const ngrokUrl = 'https://unhappy-carmine-waterlog.ngrok-free.dev'; // User's specific URL

async function checkHealth() {
    try {
        console.log(`Testing connection to: ${ngrokUrl}...`);
        // Try to hit the health check or a simple endpoint
        // Since we don't have a root / endpoint, let's try /services which is a GET
        const response = await axios.get(`${ngrokUrl}/services`, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        console.log('✅ Connection Successful!');
        console.log('Status:', response.status);
        console.log('Data sample:', response.data.slice(0, 1));
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

checkHealth();
