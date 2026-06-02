import api from './api';

export const searchService = {
    globalSearch: (query) => api.get(`/search?q=${encodeURIComponent(query)}`),
};
