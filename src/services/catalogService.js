import api from './api';

const BASE_URL = '/spc';

export const catalogService = {
    // spare part catalog endpoints
    getSpcModels: () => api.get(`${BASE_URL}/models`),
    getSpcCatalogParts: (modelCode) => api.get(`${BASE_URL}/catalot-parts/${modelCode}`)
};