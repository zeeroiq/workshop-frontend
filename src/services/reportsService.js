import api from './api';

const BASE_URL = '/reports';

export const reportsService = {
    // Report Generation Endpoints
    getFinancialSummaryReport: (criteria) => api.post(`${BASE_URL}/financial-summary`, criteria),
    getMechanicPerformanceReport: (criteria) => api.post(`${BASE_URL}/mechanic-performance`, criteria),
    getInventoryStatusReport: (criteria) => api.post(`${BASE_URL}/inventory-status`, criteria),
    getCustomerHistoryReport: (criteria) => api.post(`${BASE_URL}/customer-history`, criteria),

    // Export Endpoint - Updated to handle file downloads properly
    exportReport: (exportRequest) => {
        return api.post(`${BASE_URL}/export`, exportRequest, {
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/octet-stream',
            }
        }).then(response => {
            // Create a blob from the response
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/octet-stream'
            });

            // Extract filename from content-disposition header or use a default
            const contentDisposition = response.headers['content-disposition'];
            let filename = `report-${new Date().toISOString().split('T')[0]}`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch.length === 2) {
                    filename = filenameMatch[1];
                }
            }

            return { blob, filename };
        });
    },

    // Dashboard Endpoint
    getDashboardStats: () => api.get(`${BASE_URL}/dashboard`)
};