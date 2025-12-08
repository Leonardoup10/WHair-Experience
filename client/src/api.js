import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    timeout: 30000, // Increased timeout for cold starts
    headers: {
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
