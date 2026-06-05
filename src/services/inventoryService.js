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
    getParts: (params = {}, config = {}) => api.get(`${BASE_URL}/parts`, { params, ...config }).then(handleResponse),
    getPart: (id, config = {}) => api.get(`${BASE_URL}/parts/${id}`, config).then(handleResponse),
    getPartViaQrBarcode: (qrBarcode, config = {}) => api.get(`${BASE_URL}/parts/qr-barcode/${qrBarcode}`, config).then(handleResponse),
    createPart: (data) => api.post(`${BASE_URL}/parts`, data).then(handleResponse),
    updatePart: (id, data) => api.put(`${BASE_URL}/parts/${id}`, data).then(handleResponse),
    deletePart: (id) => api.delete(`${BASE_URL}/parts/${id}`).then(handleResponse),
    updateStock: (id, stockData) => api.patch(`${BASE_URL}/parts/${id}/stock`, stockData).then(handleResponse),
    getLowStockParts: (config = {}) => api.get(`${BASE_URL}/parts/low-stock`, config).then(handleResponse),
    searchParts: (query, config = {}) => api.get(`${BASE_URL}/parts/search`, { params: { search: query }, ...config }).then(handleResponse),
    uploadPartImage: (file) => {
        const formData = new FormData();
        formData.append("image", file);
        return api.post(`${BASE_URL}/parts/image`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    // Purchase Orders endpoints
    getPurchaseOrders: (params = {}, config = {}) => api.get(`${BASE_URL}/purchase-orders`, { params, ...config }).then(handleResponse),
    getPurchaseOrder: (id, config = {}) => api.get(`${BASE_URL}/purchase-orders/${id}`, config).then(handleResponse),
    createPurchaseOrder: (data) => api.post(`${BASE_URL}/purchase-orders`, data).then(handleResponse),
    addItemToPurchaseOrder: (id, itemData) => api.post(`${BASE_URL}/purchase-orders/${id}/items`, itemData).then(handleResponse),
    receivePurchaseOrder: (id, data) => api.post(`${BASE_URL}/purchase-orders/${id}/receive`, data).then(handleResponse),
    updatePurchaseOrderStatus: (id, status) => api.patch(`${BASE_URL}/purchase-orders/${id}/status`, { status }).then(handleResponse),
    removeItemFromPurchaseOrder: (orderId, itemId) => api.delete(`${BASE_URL}/purchase-orders/${orderId}/items/${itemId}`).then(handleResponse),

    // Suppliers endpoints
    getSuppliers: (params = {}, config = {}) => api.get(`${BASE_URL}/suppliers`, { params, ...config }).then(handleResponse),
    getSupplier: (id, config = {}) => api.get(`${BASE_URL}/suppliers/${id}`, config).then(handleResponse),
    createSupplier: (data) => api.post(`${BASE_URL}/suppliers`, data).then(handleResponse),
    updateSupplier: (id, data) => api.put(`${BASE_URL}/suppliers/${id}`, data).then(handleResponse),
    deleteSupplier: (id) => api.delete(`${BASE_URL}/suppliers/${id}`).then(handleResponse),
    searchSuppliers: (query, config = {}) => api.get(`${BASE_URL}/suppliers/search`, { params: { search: query }, ...config }).then(handleResponse),
};
