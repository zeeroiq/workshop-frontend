import api from './api';

export const dashboardService = {
    getStats: (timeRange) => api.get(`/dashboard/stats${timeRange ? `?timeRange=${timeRange}` : ''}`),
    getJobStats: () => api.get('/dashboard/job-stats'),
    getInventoryStats: () => api.get('/dashboard/inventory-stats'),
    getFinancialStats: () => api.get('/dashboard/financial-stats'),
    
    // Pinned Widgets
    getPinnedWidgets: () => api.get('/dashboard/widgets'),
    pinWidget: (widget) => api.post('/dashboard/widgets', widget),
    unpinWidget: (id) => api.delete(`/dashboard/widgets/${id}`)
};
