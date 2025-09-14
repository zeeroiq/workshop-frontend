import api from './api';

export const dashboardService = {
    getStats: () => api.get('/dashboard/stats'),
    getJobStats: () => api.get('/dashboard/job-stats'),
    getInventoryStats: () => api.get('/dashboard/inventory-stats'),
    getFinancialStats: () => api.get('/dashboard/financial-stats')
};