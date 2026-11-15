import axios from 'axios';
import {authService} from './authService';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || '/';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request for debugging
        if (import.meta.env.DEV) {
            console.log('API Request:', {url: config.url, method: config.method});
        }

        return config;
    },
    (error) => {
        if (import.meta.env.DEV) {
            console.error('API Request Error:', error);
        }
        return Promise.reject(error);
    }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => {
        // Log response for debugging
        if (import.meta.env.DEV) {
            console.log('API Response:', {
                url: response.config.url,
                status: response.status,
            });
        }

        return response;
    },
    (error) => {
        if (import.meta.env.DEV) {
            console.error('API Response Error:', {
                url: error.config?.url,
                status: error.response?.status,
            });
        }

        if (error.response?.status === 401) {
            authService.logout();
            window.location.href = '/';
        }

        return Promise.reject(error);
    }
);

export default api;