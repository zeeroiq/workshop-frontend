import api from './api';

/**
 * Parts Service
 * API calls for job parts management (ordering, tracking, arrival)
 */

const BASE_URL = '/parts';

/**
 * Fetch parts for a job
 */
export const fetchPartsByJobId = async (jobId) => {
  try {
    const response = await api.get(`${BASE_URL}?jobId=${jobId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching parts for job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Add part to a job
 */
export const addPart = async (jobId, partData) => {
  try {
    const response = await api.post(BASE_URL, {
      jobId,
      ...partData,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error adding part to job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Update part (status, cost, details)
 */
export const updatePart = async (partId, partData) => {
  try {
    const response = await api.put(`${BASE_URL}/${partId}`, partData);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating part ${partId}:`, error);
    throw error;
  }
};

/**
 * Mark part as arrived (triggers job unblock if all blocking parts arrived)
 */
export const markPartArrived = async (partId, arrivedAt = null) => {
  try {
    const response = await api.patch(`${BASE_URL}/${partId}/arrive`, {
      arrivedAt: arrivedAt || new Date().toISOString(),
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error marking part ${partId} as arrived:`, error);
    throw error;
  }
};

/**
 * Delete part from job
 */
export const deletePart = async (partId) => {
  try {
    const response = await api.delete(`${BASE_URL}/${partId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error deleting part ${partId}:`, error);
    throw error;
  }
};

/**
 * Fetch parts dashboard data (summary + tables for a date)
 */
export const fetchPartsDashboard = async (date = null) => {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const response = await api.get(`${BASE_URL}/dashboard?${params.toString()}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching parts dashboard:', error);
    throw error;
  }
};

/**
 * Fetch parts awaiting (on hold jobs)
 */
export const fetchPartsAwaiting = async (date = null) => {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const response = await api.get(`${BASE_URL}/awaiting?${params.toString()}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching awaiting parts:', error);
    throw error;
  }
};

/**
 * Fetch parts awaiting customer approval
 */
export const fetchPartsAwaitingApproval = async () => {
  try {
    const response = await api.get(`${BASE_URL}/approval-pending`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching parts awaiting approval:', error);
    throw error;
  }
};

/**
 * Fetch parts arrived today
 */
export const fetchPartsArrivedToday = async () => {
  try {
    const response = await api.get(`${BASE_URL}/arrived-today`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching arrived parts:', error);
    throw error;
  }
};

/**
 * Send customer approval request for part
 */
export const sendPartApprovalRequest = async (partId, customerContactInfo = null) => {
  try {
    const response = await api.post(`${BASE_URL}/${partId}/request-approval`, {
      customerContactInfo,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error sending approval request for part ${partId}:`, error);
    throw error;
  }
};

/**
 * Generate reorder report (low stock parts, frequently ordered)
 */
export const generateReorderReport = async () => {
  try {
    const response = await api.get(`${BASE_URL}/reorder-report`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error generating reorder report:', error);
    throw error;
  }
};

export default {
  fetchPartsByJobId,
  addPart,
  updatePart,
  markPartArrived,
  deletePart,
  fetchPartsDashboard,
  fetchPartsAwaiting,
  fetchPartsAwaitingApproval,
  fetchPartsArrivedToday,
  sendPartApprovalRequest,
  generateReorderReport,
};
