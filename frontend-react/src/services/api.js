import axios from 'axios';

// Use relative path in production to leverage Vercel Rewrites (Proxy)
// This solves Safari/iOS cookie blocking issues
const isProd = import.meta.env.PROD;
const BACKEND_URL = isProd ? '' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000');
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Unauthorized, maybe clear local storage and redirect to login
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        const message = error.response?.data?.error || 'Une erreur est survenue';
        return Promise.reject(new Error(message));
    }
);

export default api;
