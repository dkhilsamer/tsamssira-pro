import axios from 'axios';

// Use relative path in production to leverage Vercel Rewrites (Proxy)
// This solves Safari/iOS cookie blocking issues
const isProd = import.meta.env.PROD;
// Force relative path in production to ensure we use Vercel Rewrites (Same-Origin)
// This enables cookies to work correctly on Safari/iOS by treating the request as First-Party
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
            // Unauthorized: Session expired or invalid
            const wasLoggedIn = localStorage.getItem('user') !== null;
            localStorage.removeItem('user');

            // Trigger Navbar update gracefully (simulate cross-tab storage event)
            window.dispatchEvent(new Event('storage'));

            // Only force redirect if the user is in a protected area (dashboard, edit, payment)
            const path = window.location.pathname;
            const isProtected = path.startsWith('/dashboard') || path.startsWith('/edit') || path.startsWith('/payment');

            if (wasLoggedIn && isProtected && !path.includes('/login')) {
                window.location.href = '/login?expired=true';
            }
        }
        const message = error.response?.data?.error || 'Une erreur est survenue';
        return Promise.reject(new Error(message));
    }
);

export default api;
