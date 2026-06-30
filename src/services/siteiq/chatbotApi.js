import api from '../api';

export const chatbotApi = {
    list: (params) => api.get('/chatbots', { params }).then(res => res.data),
    get: (id) => api.get(`/chatbots/${id}`).then(res => res.data),
    create: (body) => api.post('/chatbots', body).then(res => res.data),
    update: (id, body) => api.patch(`/chatbots/${id}`, body).then(res => res.data),
    remove: (id) => api.delete(`/chatbots/${id}`).then(res => res.data),
    startScrape: (id, opts) => api.post(`/chatbots/${id}/scrape`, opts).then(res => res.data),
    getActiveJob: (id) => api.get(`/chatbots/${id}/scrape/jobs/active`).then(res => res.data),
    listPages: (id, params) => api.get(`/chatbots/${id}/pages`, { params }).then(res => res.data),
    deletePage: (id, pageId) => api.delete(`/chatbots/${id}/pages/${pageId}`).then(res => res.data),
    getEmbedCode: (id) => api.get(`/chatbots/${id}/embed-code`).then(res => res.data),
    getApiKey: (id) => api.get(`/chatbots/${id}/api-key`).then(res => res.data),
    regenerateKey: (id) => api.post(`/chatbots/${id}/regenerate-key`).then(res => res.data),
    getAnalytics: (id, from, to) => api.get(`/chatbots/${id}/analytics`, { params: { from, to } }).then(res => res.data),
};
