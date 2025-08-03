import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
    baseURL: 'http://localhost:3001',
    withCredentials: true, // Sends cookies automatically
    timeout: 10000, // Request times out after 10 seconds
    headers: {
        'Content-Type': 'application/json', // Tells server we're sending JSON
        'Accept': 'application/json', // Tells server we want JSON back
        'X-Requested-With': 'XMLHttpRequest' // Identifies as AJAX request
    }
});

// Request interceptor - runs before every request
api.interceptors.request.use(
    (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        
        // Note: We're using cookies for authentication (withCredentials: true)
        // If you want to use header-based auth instead, uncomment this:
        // const token = localStorage.getItem('authToken');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        
        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - runs after every response
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', error.response?.status, error.response?.data);
        
        // Handle 401 (Unauthorized) - user needs to login again
        if (error.response?.status === 401) {
            console.log('🔐 User not authenticated, redirecting to login...');
            // You could redirect to login page here
            // window.location.href = '/login';
        }
        
        return Promise.reject(error);
    }
);

export default api; 