import api from './api';

export const jobService = {
    getAllJobs: (page = 0, size = 10, search = '') => {
        const params = { page, size };
        if (search) params.search = search;
        return api.get('/jobs', { params })
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            });
    },

    getJobById: (id) =>
        api.get(`/jobs/${id}`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    getJobByCustomerId: (customerId) =>
        api.get(`/jobs/customer/${customerId}`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    getJobByMechanicId: (mechanicId) =>
        api.get(`/jobs/mechanic/${mechanicId}`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    getJobsByStatus: (status) =>
        api.get(`/jobs/status/${status}`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    getJobSByVehicleId: (vehicleId) =>
        api.get(`/jobs/vehicle/${vehicleId}`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    createJob: (jobData) =>
        api.post('/jobs', jobData)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    updateJob: (id, jobData) =>
        api.put(`/jobs/${id}`, jobData)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    deleteJob: (id) =>
        api.delete(`/jobs/${id}`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    assignMechanic: (jobId, mechanicId) =>
        api.post(`/jobs/${jobId}/assign-mechanic`, { mechanicId })
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    convertEstimateToJob: (jobId) =>
        api.post(`/jobs/${jobId}/convert-to-job`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    createInvoice: (jobId) =>
        api.post(`/jobs/${jobId}/create-invoice`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    addItemToJob: (jobId, item) =>
        api.post(`/jobs/${jobId}/items`, { item })
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    addNoteToJob: (jobId, note) =>
        api.post(`/jobs/${jobId}/notes`, { note })
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    updateJobStatus: (jobId, status) =>
        api.post(`/jobs/${jobId}/status`, { status })
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),

    removeItemFromJob: (jobId, itemId) =>
        api.delete(`/jobs/${jobId}/items/${itemId}`)
            .then(response => {
                if (response?.data?.success) {
                    return {
                        ...response,
                        data: response.data.data
                    };
                }
                return response;
            }),
}