import api from './api';

const BASE_URL = '/manage/1';

export const workshopMgmtService = {
    listAll: () => {
        return api.get(`${BASE_URL}/users`)
            .then(response => {
                // Handle the API response structure
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            });
    },

    create: (customerData) =>
        api.post(`${BASE_URL}/users`, customerData)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    update: (id, customerData) =>
        api.put(`${BASE_URL}/users/${id}`, customerData)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    delete: (id) =>
        api.delete(`${BASE_URL}/users/${id}`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    listAllRoles: () => {
        return api.get(`${BASE_URL}/roles`)
            .then(response => {
                // The user said this returns an array of strings.
                if (response?.data?.success) {
                    // const rolesString = response.data.data.roles;
                    // const rolesArray = rolesString ? rolesString.split(',') : [];
                    return {
                        ...response,
                        data: response.data.data.roles
                    };
                }
                return response;
            });
    },

    createRole: (roleName) =>
        api.post(`${BASE_URL}/roles`, { name: roleName })
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    deleteRole: (roleName) =>
        api.delete(`${BASE_URL}/roles/${roleName}`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            })


};