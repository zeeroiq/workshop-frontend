import api from './api';

export const authService = {
    login: (username, password) =>
        api.post('/auth/login', { username: username, password }), // todo - update later to support login via username/mobile no/oauth

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
        return user && user.roles && user.roles.includes(role);
    }
};