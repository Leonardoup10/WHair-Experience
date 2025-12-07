import axios from 'axios';

const api = axios.create({
    baseURL: 'https://unhappy-carmine-waterlog.ngrok-free.dev', // Hardcoded for debugging
    headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
    }
});

export default api;
