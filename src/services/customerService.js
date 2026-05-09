import api from './api';

export const customerService = {
    getAll: (page = 0, size = 10, search = '', config = {}) => {
        const params = { page, size };
        if (search) params.search = search;
        return api.get('/customers', { params, ...config })
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
    listAll: (config = {}) => {
        return api.get('/customers', config)
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

    getById: (id, config = {}) =>
        api.get(`/customers/${id}`, config)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    getWithVehicles: (id, config = {}) =>
        api.get(`/customers/${id}/with-vehicles`, config)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    create: (customerData) =>
        api.post('/customers', customerData)
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
        api.put(`/customers/${id}`, customerData)
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
        api.delete(`/customers/${id}`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    search: (query) =>
        api.get(`/customers/search?q=${query}`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    addNote: (customerId, note) =>
        api.post(`/customers/${customerId}/notes`, note)
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