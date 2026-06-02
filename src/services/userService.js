import api from './api';

export const userService = {

    getByRole: (role, page = 0, size = 10, search = '', config = {}) => {
        const params = { page, size };
        if (search) params.search = search;
        return api.get(`/users/role/${role}`, { params, ...config })
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            });
    },

    createUser: (userData) => 
        api.post('/auth/register', userData)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),
};
