import api from './api';

const BASE_URL = '/manage';

export const workshopMgmtService = {
    // User management
    listUsers: (workshopId) => {
        if (!workshopId) throw new Error('Workshop ID is required');
        return api.get(`${BASE_URL}/${workshopId}/users`)
            .then(response => response.data.data);
    },

    createUser: (workshopId, userData) => {
        if (!workshopId) throw new Error('Workshop ID is required');
        return api.post(`${BASE_URL}/${workshopId}/users`, userData)
            .then(response => response.data);
    },

    updateUser: (workshopId, userId, userData) => {
        if (!workshopId) throw new Error('Workshop ID is required');
        return api.put(`${BASE_URL}/${workshopId}/users/${userId}`, userData)
            .then(response => response.data);
    },

    deleteUser: (workshopId, userId) => {
        if (!workshopId) throw new Error('Workshop ID is required');
        return api.delete(`${BASE_URL}/${workshopId}/users/${userId}`)
            .then(response => response.data);
    },

    // Role & Permission management
    listRoles: (workshopId) => {
        return api.get(`${BASE_URL}/${workshopId || 1}/roles`)
            .then(response => response.data.data.roles);
    },

    listAllPermissions: () => {
        return api.get(`${BASE_URL}/permissions`)
            .then(response => response.data.data);
    },

    getPermissionsForRole: (roleName) => {
        return api.get(`${BASE_URL}/roles/${roleName}/permissions`)
            .then(response => response.data.data);
    }
};
