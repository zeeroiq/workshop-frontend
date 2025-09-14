import api from './api';

export const customerService = {
    getAll: (page = 0, size = 10) =>
        api.get(`/customers?page=${page}&size=${size}`),

    getById: (id) =>
        api.get(`/customers/${id}`),

    create: (customerData) =>
        api.post('/customers', customerData),

    update: (id, customerData) =>
        api.put(`/customers/${id}`, customerData),

    delete: (id) =>
        api.delete(`/customers/${id}`),

    search: (query) =>
        api.get(`/customers/search?q=${query}`),

    addNote: (customerId, note) =>
        api.post(`/customers/${customerId}/notes`, note),

    getWithVehicles: (customerId) =>
        api.get(`/customers/${customerId}/with-vehicles`)
};