import { api } from './api';

/**
 * Job Service
 * API calls for job management (CRUD, status changes, notes, etc.)
 */

const BASE_URL = '/jobs';

/**
 * Fetch all jobs with optional filters
 */
export const fetchJobs = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.date) params.append('date', filters.date);
    if (filters.bayId) params.append('bayId', filters.bayId);
    if (filters.techId) params.append('techId', filters.techId);
    if (filters.status) params.append('status', filters.status);
    if (filters.customerId) params.append('customerId', filters.customerId);
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.start);
      params.append('endDate', filters.dateRange.end);
    }

    const response = await api.get(`${BASE_URL}?${params.toString()}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

/**
 * Fetch single job with all relations
 */
export const fetchJobById = async (jobId) => {
  try {
    const response = await api.get(`${BASE_URL}/${jobId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Fetch jobs for a specific date
 */
export const fetchJobsByDate = async (date) => {
  try {
    const response = await api.get(`${BASE_URL}/day/${date}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching jobs for date ${date}:`, error);
    throw error;
  }
};

/**
 * Fetch jobs for a specific week
 */
export const fetchJobsByWeek = async (startDate) => {
  try {
    const response = await api.get(`${BASE_URL}/week/${startDate}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching jobs for week starting ${startDate}:`, error);
    throw error;
  }
};

/**
 * Create a new job
 */
export const createJob = async (jobData) => {
  try {
    const response = await api.post(BASE_URL, jobData);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

/**
 * Update job (full or partial update)
 */
export const updateJob = async (jobId, jobData) => {
  try {
    const response = await api.put(`${BASE_URL}/${jobId}`, jobData);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Update job status only
 */
export const updateJobStatus = async (jobId, status, note = null, changedBy = null) => {
  try {
    const payload = { status, changedBy };
    if (note) payload.note = note;

    const response = await api.patch(`${BASE_URL}/${jobId}/status`, payload);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating job ${jobId} status:`, error);
    throw error;
  }
};

/**
 * Delete/cancel job (soft delete)
 */
export const deleteJob = async (jobId, cancellationReason = '') => {
  try {
    const response = await api.delete(`${BASE_URL}/${jobId}`, {
      data: { reason: cancellationReason },
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error deleting job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Get job status history
 */
export const fetchJobHistory = async (jobId) => {
  try {
    const response = await api.get(`${BASE_URL}/${jobId}/history`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching history for job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Add note to job
 */
export const addJobNote = async (jobId, noteData) => {
  try {
    const response = await api.post(`${BASE_URL}/${jobId}/notes`, noteData);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error adding note to job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Delete note from job
 */
export const deleteJobNote = async (jobId, noteId) => {
  try {
    const response = await api.delete(`${BASE_URL}/${jobId}/notes/${noteId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error deleting note ${noteId} from job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Reschedule job (change bay/time)
 */
export const rescheduleJob = async (jobId, bayId, date, startTime, endTime) => {
  try {
    const response = await api.patch(`${BASE_URL}/${jobId}/reschedule`, {
      bayId,
      date,
      startTime,
      endTime,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error rescheduling job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Reassign technician on job
 */
export const reassignTechnician = async (jobId, technicianId) => {
  try {
    const response = await api.patch(`${BASE_URL}/${jobId}/reassign`, {
      technicianId,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error reassigning job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Duplicate job (create copy for another day)
 */
export const duplicateJob = async (jobId, newDate) => {
  try {
    const response = await api.post(`${BASE_URL}/${jobId}/duplicate`, {
      date: newDate,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error duplicating job ${jobId}:`, error);
    throw error;
  }
};

export default {
  fetchJobs,
  fetchJobById,
  fetchJobsByDate,
  fetchJobsByWeek,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
  fetchJobHistory,
  addJobNote,
  deleteJobNote,
  rescheduleJob,
  reassignTechnician,
  duplicateJob,
};
