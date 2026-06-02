import api from './api';

export const jobService = {
    getAllJobs: (page = 0, size = 10, jobStatus = '', search = '') => {
        const params = { page, size };
        if (jobStatus) params.jobStatus = jobStatus;
        if (search) params.search = search;
        return api.get('/jobs', { params })
            .then(response => response.data.success ? { ...response, data: response.data.data } : response);
    },

    getJobById: (id) =>
        api.get(`/jobs/${id}`)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    getJobLikeJobNumber: (jobNumber) =>
        api.get(`/jobs/alike/${jobNumber}`)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    createJob: (jobData) =>
        api.post('/jobs', jobData)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    updateJob: (id, jobData) =>
        api.put(`/jobs/${id}`, jobData)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    updateJobBuNumber: (jobNumber, jobData) =>
        api.put(`/jobs/${jobNumber}/by-number`, jobData)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    deleteJob: (id) =>
        api.delete(`/jobs/${id}`)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    updateJobStatus: (id, status) =>
        api.patch(`/jobs/${id}/status?status=${status}`)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    assignMechanic: (id, mechanicId) =>
        api.patch(`/jobs/${id}/assign-mechanic?mechanicId=${mechanicId}`)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    addJobItem: (id, itemDTO) =>
        api.post(`/jobs/${id}/items`, itemDTO)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    removeJobItem: (jobId, itemId) =>
        api.delete(`/jobs/${jobId}/items/${itemId}`)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    addJobNote: (id, noteDTO) =>
        api.post(`/jobs/${id}/notes`, noteDTO)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    convertEstimateToJob: (id) =>
        api.post(`/jobs/${id}/convert-to-job`)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    createInvoice: (id) =>
        api.post(`/jobs/${id}/create-invoice`)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    getJobsByStatus: (status) =>
        api.get(`/jobs/status/${status}`)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    getJobsByVehicle: (vehicleId) =>
        api.get(`/jobs/vehicle/${vehicleId}`)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    getJobsByCustomer: (customerId) =>
        api.get(`/jobs/customer/${customerId}`)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response),

    getJobsByMechanic: (mechanicId) =>
        api.get(`/jobs/mechanic/${mechanicId}`)
            .then(response => response.data.success ? { ...response, data: response.data.data } : response)
};
