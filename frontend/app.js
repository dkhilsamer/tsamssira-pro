// API Configuration - Auto-detect environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const BACKEND_URL = isProduction
    ? 'https://tsamssira-pro.onrender.com'  // ⚠️ REMPLACEZ PAR VOTRE VRAIE URL RENDER
    : 'http://localhost:3000';

const API_BASE = `${BACKEND_URL}/api`;
const SERVER_URL = BACKEND_URL;

// API Helper Functions
const api = {
    async request(endpoint, options = {}) {
        try {
            const headers = { ...options.headers };

            // Only add JSON content-type if not FormData
            if (!(options.body instanceof FormData)) {
                headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers,
                credentials: 'include'
            });

            if (response.status === 401) {
                // Session expired or invalid
                utils.setUser(null);
                window.location.href = 'login.html';
                throw new Error('Session expirée. Veuillez vous reconnecter.');
            }

            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // If not JSON (e.g. 404 HTML from Express), read as text
                const text = await response.text();
                // If it's a 404 Not Found, throw intelligible error
                if (response.status === 404) {
                    throw new Error('Ressource introuvable (API 404). Vérifiez que le serveur est redémarré.');
                }
                throw new Error('Erreur serveur (réponse non-JSON): ' + text.substring(0, 50));
            }

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Auth endpoints
    async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    },

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    async logout() {
        return this.request('/auth/logout', {
            method: 'POST'
        });
    },

    async getUsers() {
        return this.request('/auth/users');
    },

    async deleteUser(id) {
        return this.request(`/auth/users/${id}`, {
            method: 'DELETE'
        });
    },

    async updateUserRole(id, role) {
        return this.request(`/auth/users/${id}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    },

    async forgotPassword(email) {
        return this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    async resetPassword(token, newPassword) {
        return this.request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, newPassword })
        });
    },

    // Property endpoints
    async getProperties(filters = {}) {
        // Build query string
        const searchParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                searchParams.append(key, value);
            }
        });
        const queryString = searchParams.toString();
        const url = queryString ? `/properties?${queryString}` : '/properties';
        return this.request(url);
    },

    async getMyProperties() {
        return this.request('/properties/my-properties');
    },

    async getProperty(id) {
        return this.request(`/properties/${id}`);
    },

    async createProperty(propertyData) {
        return this.request('/properties', {
            method: 'POST',
            body: propertyData instanceof FormData ? propertyData : JSON.stringify(propertyData)
        });
    },

    async updateProperty(id, propertyData) {
        return this.request(`/properties/${id}`, {
            method: 'PUT',
            body: JSON.stringify(propertyData)
        });
    },

    async deleteProperty(id) {
        return this.request(`/properties/${id}`, {
            method: 'DELETE'
        });
    },

    async toggleAppVisibility(id, isVisible) {
        return this.request(`/properties/${id}/visibility`, {
            method: 'PUT',
            body: JSON.stringify({ is_visible: isVisible })
        });
    },

    // Boost Request endpoints
    async requestBoost(propertyId) {
        return this.request(`/payment/request/${propertyId}`, {
            method: 'POST'
        });
    },

    async getMyBoostRequests() {
        return this.request('/payment/my-requests');
    },

    async getPendingBoostRequests() {
        return this.request('/payment/pending');
    },

    async approveBoostRequest(id) {
        return this.request(`/payment/approve/${id}`, {
            method: 'PUT'
        });
    },

    async rejectBoostRequest(id) {
        return this.request(`/payment/reject/${id}`, {
            method: 'PUT'
        });
    },

    async adminBoost(propertyId) {
        return this.request(`/payment/boost/${propertyId}`, {
            method: 'POST'
        });
    },

    async removeBoost(id) {
        return this.request(`/properties/${id}/boost`, {
            method: 'DELETE'
        });
    },

    // Request endpoints
    async getRequests() {
        return this.request('/requests');
    },

    async submitRequest(requestData) {
        return this.request('/requests', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
    },

    async updateRequestStatus(id, status) {
        return this.request(`/requests/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    // Dashboard endpoints
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    },

    async getDashboardAnalytics() {
        return this.request('/dashboard/analytics');
    },


};

// Utility Functions
const utils = {
    formatPrice(price) {
        return new Intl.NumberFormat('fr-TN', {
            style: 'currency',
            currency: 'TND',
            minimumFractionDigits: 2
        }).format(price);
    },

    formatDate(date) {
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    getBoostRemainingDays(boostEndDate) {
        if (!boostEndDate) return 0;
        const now = new Date();
        const endDate = new Date(boostEndDate);
        const diffTime = endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    },

    getImageUrl(path) {
        if (!path) return 'https://via.placeholder.com/400x300?text=No+Image';
        if (path.startsWith('http')) return path;
        // Check if path already contains /uploads/ to avoid potential duplication issues if backend path format changes
        // Backend stores as '/uploads/filename.jpg'
        if (path.startsWith('/')) return `${SERVER_URL}${path}`;
        return `${SERVER_URL}/${path}`;
    },

    showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;

        const container = document.querySelector('.container') || document.body;
        container.insertBefore(alertDiv, container.firstChild);

        setTimeout(() => alertDiv.remove(), 5000);
    },

    showLoading(show = true) {
        let loader = document.getElementById('loader');
        if (!loader && show) {
            loader = document.createElement('div');
            loader.id = 'loader';
            loader.className = 'loading';
            loader.innerHTML = '<div class="spinner"></div><p>Chargement...</p>';
            document.body.appendChild(loader);
        }
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    },

    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    setUser(user) {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    },

    isLoggedIn() {
        return !!this.getUser();
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    updateNav() {
        const user = this.getUser();
        const authLinks = document.getElementById('authLinks');
        if (!authLinks) return;

        if (user) {
            authLinks.innerHTML = `
                <li><a href="dashboard.html">Dashboard</a></li>
                <li><a href="#" id="logoutBtn">Déconnexion</a></li>
            `;

            document.getElementById('logoutBtn').addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await api.logout();
                    utils.setUser(null);
                    utils.showAlert('Déconnexion réussie', 'success');
                    setTimeout(() => window.location.href = 'index.html', 1000);
                } catch (error) {
                    utils.showAlert('Erreur lors de la déconnexion', 'error');
                }
            });
        } else {
            authLinks.innerHTML = `
                <li><a href="login.html">Connexion</a></li>
                <li><a href="register.html">Inscription</a></li>
            `;
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    utils.updateNav();

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    // Frontend Protection: Disable right-click and dev tools shortcuts
    document.addEventListener('contextmenu', event => event.preventDefault());

    document.addEventListener('keydown', function (event) {
        if (
            event.keyCode === 123 || // F12
            (event.ctrlKey && event.shiftKey && event.keyCode === 73) || // Ctrl+Shift+I
            (event.ctrlKey && event.shiftKey && event.keyCode === 74) || // Ctrl+Shift+J
            (event.ctrlKey && event.keyCode === 85) // Ctrl+U
        ) {
            event.preventDefault();
            return false;
        }
    });
});
