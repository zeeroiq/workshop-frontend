import api from './api';

const BASE_URL = '/reports';

export const reportsService = {
    // Report Generation Endpoints
    getFinancialSummaryReport: (criteria) => api.post(`${BASE_URL}/financial-summary`, criteria),
    getMechanicPerformanceReport: (criteria) => api.post(`${BASE_URL}/mechanic-performance`, criteria),
    getInventoryStatusReport: (criteria) => api.post(`${BASE_URL}/inventory-status`, criteria),
    getCustomerHistoryReport: (criteria) => api.post(`${BASE_URL}/customer-history`, criteria),

    // Export Endpoint
    exportReport: (exportRequest) => api.post(`${BASE_URL}/export`, exportRequest, {
        responseType: 'blob' // Important for file downloads
    }),

    // Dashboard Endpoint
    getDashboardStats: () => api.get(`${BASE_URL}/dashboard`)
};