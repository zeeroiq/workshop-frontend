import api from './api';

export const searchService = {
    globalSearch: (query) => api.get(`/v1/search?q=${encodeURIComponent(query)}`),
};
