
const axios = require('axios');

async function checkNgrok() {
    try {
        const response = await axios.get('http://127.0.0.1:4040/api/tunnels');
        const tunnels = response.data.tunnels;
        if (tunnels.length > 0) {
            console.log('Active Tunnels:');
            tunnels.forEach(t => console.log(`- ${t.public_url} -> ${t.config.addr}`));
        } else {
            console.log('No active tunnels found.');
        }
    } catch (error) {
        console.error('Could not connect to Ngrok API:', error.message);
    }
}

checkNgrok();
