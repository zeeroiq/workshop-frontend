import api from './api';

export const inventoryService = {
    // Parts
    getParts: (page = 0, size = 10, search = '') => {
        const params = { page, size };
        if (search) params.search = search;
        return api.get('/inventory/parts', { params })
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

    getPartById: (id) =>
        api.get(`/inventory/parts/${id}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    createPart: (partData) =>
        api.post('/inventory/parts', partData)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    updatePart: (id, partData) =>
        api.put(`/inventory/parts/${id}`, partData)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    deletePart: (id) =>
        api.delete(`/inventory/parts/${id}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    updateStockLevel: (id, quantity) =>
        api.patch(`/inventory/parts/${id}/stock?quantity=${quantity}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    getLowStockParts: () =>
        api.get('/inventory/parts/low-stock')
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    // Suppliers
    getSuppliers: (page = 0, size = 10, search = '') => {
        const params = { page, size };
        if (search) params.search = search;
        return api.get('/inventory/suppliers', { params })
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

    getSupplierById: (id) =>
        api.get(`/inventory/suppliers/${id}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    createSupplier: (supplierData) =>
        api.post('/inventory/suppliers', supplierData)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    updateSupplier: (id, supplierData) =>
        api.put(`/inventory/suppliers/${id}`, supplierData)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    deleteSupplier: (id) =>
        api.delete(`/inventory/suppliers/${id}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    searchSuppliers: (query) =>
        api.get(`/inventory/suppliers/search?q=${query}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    // Purchase Orders
    getPurchaseOrders: (page = 0, size = 10, status = '') => {
        const params = { page, size };
        if (status) params.status = status;
        return api.get('/inventory/purchase-orders', { params })
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

    getPurchaseOrderById: (id) =>
        api.get(`/inventory/purchase-orders/${id}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    createPurchaseOrder: (orderData) =>
        api.post('/inventory/purchase-orders', orderData)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    updatePurchaseOrderStatus: (id, status) =>
        api.patch(`/inventory/purchase-orders/${id}/status?status=${status}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    addItemToPurchaseOrder: (orderId, itemData) =>
        api.post(`/inventory/purchase-orders/${orderId}/items`, itemData)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    removeItemFromPurchaseOrder: (orderId, itemId) =>
        api.delete(`/inventory/purchase-orders/${orderId}/items/${itemId}`)
            .then(response => {
                if (response.data && response.data.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    receivePurchaseOrder: (orderId) =>
        api.post(`/inventory/purchase-orders/${orderId}/receive`)
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