import api from './api';

const BASE_URL = '/invoices';

export const invoiceService = {
    // Core CRUD Operations
    createInvoice: (data) => api.post(BASE_URL, data),
    getInvoiceById: (id) => api.get(`${BASE_URL}/${id}`),
    getAllInvoices: (params = {}) => api.get(BASE_URL, { params }),
    updateInvoice: (id, data) => api.put(`${BASE_URL}/${id}`, data),
    deleteInvoice: (id) => api.delete(`${BASE_URL}/${id}`),

    // Filtering and Searching
    getInvoicesByCustomer: (customerId) => api.get(`${BASE_URL}/customer/${customerId}`),
    getInvoicesByStatus: (status) => api.get(`${BASE_URL}/status/${status}`),
    getOverdueInvoices: () => api.get(`${BASE_URL}/overdue`),

    // Actions and State Changes
    updateInvoiceStatus: (id, status) => api.patch(`${BASE_URL}/${id}/status`, null, {
        params: { status }
    }),
    addPaymentToInvoice: (id, paymentData) => api.post(`${BASE_URL}/${id}/payments`, paymentData),
    createInvoiceFromJob: (jobId) => api.post(`${BASE_URL}/from-job/${jobId}`),
    sendInvoice: (id) => api.post(`${BASE_URL}/${id}/send`),
    cancelInvoice: (id) => api.post(`${BASE_URL}/${id}/cancel`),

    // Financial Reporting
    getTotalRevenue: (startDate, endDate) => api.get(`${BASE_URL}/revenue`, {
        params: { startDate, endDate }
    }),
    getAccountsReceivable: () => api.get(`${BASE_URL}/accounts-receivable`)
};