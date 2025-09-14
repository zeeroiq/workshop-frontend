import api from './api';

export const vehicleService = {
    getAll: (page = 0, size = 10, search = '') => {
        const params = { page, size };
        if (search) params.search = search;
        return api.get('/vehicles', { params })
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            });
    },

    getById: (id) =>
        api.get(`/vehicles/${id}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    getHistory: (id) =>
        api.get(`/vehicles/${id}/history`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    create: (vehicleData) =>
        api.post('/vehicles', vehicleData)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    update: (id, vehicleData) =>
        api.put(`/vehicles/${id}`, vehicleData)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    delete: (id) =>
        api.delete(`/vehicles/${id}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    search: (query) =>
        api.get(`/vehicles/search?q=${query}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    addNote: (vehicleId, note) =>
        api.post(`/vehicles/${vehicleId}/notes`, note)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    updateMileage: (id, mileage) =>
        api.patch(`/vehicles/${id}/mileage?mileage=${mileage}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            })
};