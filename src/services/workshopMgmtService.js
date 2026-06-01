import api from './api';

const BASE_URL = '/manage';

export const workshopMgmtService = {
    // User management
    listUsers: (workshopId) => {
        return api.get(`${BASE_URL}/${workshopId || 1}/users`)
            .then(response => response.data.data);
    },

    createUser: (workshopId, userData) => {
        return api.post(`${BASE_URL}/${workshopId || 1}/users`, userData)
            .then(response => response.data);
    },

    updateUser: (workshopId, userId, userData) => {
        return api.put(`${BASE_URL}/${workshopId || 1}/users/${userId}`, userData)
            .then(response => response.data);
    },

    deleteUser: (workshopId, userId) => {
        return api.delete(`${BASE_URL}/${workshopId || 1}/users/${userId}`)
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
