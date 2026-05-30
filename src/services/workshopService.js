import api from './api';

export const workshopService = {
    getSettings: async () => {
        const response = await api.get('/workshop/settings');
        return response.data;
    },

    updateSettings: async (settings) => {
        const response = await api.put('/workshop/settings', settings);
        return response.data;
    },

    uploadLogo: async (file) => {
        const formData = new FormData();
        formData.append('logo', file);
        const response = await api.post('/workshop/settings/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
