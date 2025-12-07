import axios from 'axios';

const api = axios.create({
    baseURL: 'https://unhappy-carmine-waterlog.ngrok-free.dev', // Hardcoded for debugging
    timeout: 10000, // 10s timeout
    headers: {
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
    }
});

// Add debug interceptors
api.interceptors.request.use(request => {
    console.log('[API Request]:', request.url, request.baseURL);
    return request;
});

api.interceptors.response.use(
    response => {
        console.log('[API Response]:', response.status, response.data);
        return response;
    },
    error => {
        console.error('[API Error]:', error);
        return Promise.reject(error);
    }
);

export default api;
