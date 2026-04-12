import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
    withCredentials: true, // Sends cookies automatically
    timeout: 30000, // Request times out after 10 seconds
    headers: {
        'Content-Type': 'application/json', // Tells server we're sending JSON
        'Accept': 'application/json', // Tells server we want JSON back
        'X-Requested-With': 'XMLHttpRequest' // Identifies as AJAX request
    }
});

// Request interceptor - runs before every request
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - runs after every response
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export default api; 