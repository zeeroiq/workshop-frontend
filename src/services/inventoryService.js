import api from './api';

const BASE_URL = '/inventory';

export const inventoryService = {
    // Parts endpoints
    getParts: (params = {}) => api.get(`${BASE_URL}/parts`, { params }),
    getPart: (id) => api.get(`${BASE_URL}/parts/${id}`),
    createPart: (data) => api.post(`${BASE_URL}/parts`, data),
    updatePart: (id, data) => api.put(`${BASE_URL}/parts/${id}`, data),
    deletePart: (id) => api.delete(`${BASE_URL}/parts/${id}`),
    updateStock: (id, stockData) => api.patch(`${BASE_URL}/parts/${id}/stock`, stockData),
    getLowStockParts: () => api.get(`${BASE_URL}/parts/low-stock`),
    searchParts: (query) => api.get(`${BASE_URL}/parts/search`, { params: { q: query } }),

    // Purchase Orders endpoints
    getPurchaseOrders: (params = {}) => api.get(`${BASE_URL}/purchase-orders`, { params }),
    getPurchaseOrder: (id) => api.get(`${BASE_URL}/purchase-orders/${id}`),
    createPurchaseOrder: (data) => api.post(`${BASE_URL}/purchase-orders`, data),
    addItemToPurchaseOrder: (id, itemData) => api.post(`${BASE_URL}/purchase-orders/${id}/items`, itemData),
    receivePurchaseOrder: (id, data) => api.post(`${BASE_URL}/purchase-orders/${id}/receive`, data),
    updatePurchaseOrderStatus: (id, status) => api.patch(`${BASE_URL}/purchase-orders/${id}/status`, { status }),
    removeItemFromPurchaseOrder: (orderId, itemId) => api.delete(`${BASE_URL}/purchase-orders/${orderId}/items/${itemId}`),

    // Suppliers endpoints
    getSuppliers: (params = {}) => api.get(`${BASE_URL}/suppliers`, { params }),
    getSupplier: (id) => api.get(`${BASE_URL}/suppliers/${id}`),
    createSupplier: (data) => api.post(`${BASE_URL}/suppliers`, data),
    updateSupplier: (id, data) => api.put(`${BASE_URL}/suppliers/${id}`, data),
    deleteSupplier: (id) => api.delete(`${BASE_URL}/suppliers/${id}`),
    searchSuppliers: (query) => api.get(`${BASE_URL}/suppliers/search`, { params: { q: query } }),
};