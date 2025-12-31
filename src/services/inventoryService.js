import api from './api';

const BASE_URL = '/inventory';
const handleResponse = (response) => {
    if (response?.data?.success) {
        return {
            ...response,
            data: {
                ...response.data.data,
                success: response.data.success,
            },
        };
    }
    return response;
};

export const inventoryService = {
    // Parts endpoints
    getParts: (params = {}) => api.get(`${BASE_URL}/parts`, { params }).then(handleResponse),
    getPart: (id) => api.get(`${BASE_URL}/parts/${id}`).then(handleResponse),
    createPart: (data) => api.post(`${BASE_URL}/parts`, data).then(handleResponse),
    updatePart: (id, data) => api.put(`${BASE_URL}/parts/${id}`, data).then(handleResponse),
    deletePart: (id) => api.delete(`${BASE_URL}/parts/${id}`).then(handleResponse),
    updateStock: (id, stockData) => api.patch(`${BASE_URL}/parts/${id}/stock`, stockData).then(handleResponse),
    getLowStockParts: () => api.get(`${BASE_URL}/parts/low-stock`).then(handleResponse),
    searchParts: (query) => api.get(`${BASE_URL}/parts/search`, { params: { q: query } }).then(handleResponse),

    // Purchase Orders endpoints
    getPurchaseOrders: (params = {}) => api.get(`${BASE_URL}/purchase-orders`, { params }).then(handleResponse),
    getPurchaseOrder: (id) => api.get(`${BASE_URL}/purchase-orders/${id}`).then(handleResponse),
    createPurchaseOrder: (data) => api.post(`${BASE_URL}/purchase-orders`, data).then(handleResponse),
    addItemToPurchaseOrder: (id, itemData) => api.post(`${BASE_URL}/purchase-orders/${id}/items`, itemData).then(handleResponse),
    receivePurchaseOrder: (id, data) => api.post(`${BASE_URL}/purchase-orders/${id}/receive`, data).then(handleResponse),
    updatePurchaseOrderStatus: (id, status) => api.patch(`${BASE_URL}/purchase-orders/${id}/status`, { status }).then(handleResponse),
    removeItemFromPurchaseOrder: (orderId, itemId) => api.delete(`${BASE_URL}/purchase-orders/${orderId}/items/${itemId}`).then(handleResponse),

    // Suppliers endpoints
    getSuppliers: (params = {}) => api.get(`${BASE_URL}/suppliers`, { params }).then(handleResponse),
    getSupplier: (id) => api.get(`${BASE_URL}/suppliers/${id}`).then(handleResponse),
    createSupplier: (data) => api.post(`${BASE_URL}/suppliers`, data).then(handleResponse),
    updateSupplier: (id, data) => api.put(`${BASE_URL}/suppliers/${id}`, data).then(handleResponse),
    deleteSupplier: (id) => api.delete(`${BASE_URL}/suppliers/${id}`).then(handleResponse),
    searchSuppliers: (query) => api.get(`${BASE_URL}/suppliers/search`, { params: { q: query } }).then(handleResponse),
};
