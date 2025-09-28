import api from './api';

export const authService = {
    login: (username, password) =>
        api.post('/auth/login', { username, password }),

    register: (userData) =>
        api.post('/auth/register', userData),

    getCurrentUser: () =>
        api.get('/auth/me'),

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    setToken: (token) => {
        localStorage.setItem('token', token);
    },

    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },

    hasRole: (role) => {
        const user = authService.getUser();
        return user?.roles?.includes(role);
    },

    // Helper method to get user info from the token
    getUserInfo: () => {
        const user = authService.getUser();
        if (user) {
            return {
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles
            };
        }
        return null;
    }
};