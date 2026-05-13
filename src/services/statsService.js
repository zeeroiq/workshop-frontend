import api from './api';

/**
 * Stats Service
 * API calls for dashboard statistics and metrics
 */

const BASE_URL = '/stats';

/**
 * Fetch day stats (job count, utilisation, overdue, awaiting parts)
 */
export const fetchDayStats = async (date) => {
  try {
    const response = await api.get(`${BASE_URL}/day?date=${date}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching day stats for ${date}:`, error);
    throw error;
  }
};

/**
 * Fetch week stats (revenue, utilisation, completed jobs)
 */
export const fetchWeekStats = async (startDate) => {
  try {
    const response = await api.get(`${BASE_URL}/week?startDate=${startDate}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching week stats for ${startDate}:`, error);
    throw error;
  }
};

/**
 * Fetch month stats
 */
export const fetchMonthStats = async (year, month) => {
  try {
    const response = await api.get(`${BASE_URL}/month?year=${year}&month=${month}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching month stats for ${year}-${month}:`, error);
    throw error;
  }
};

/**
 * Fetch technician utilisation stats for a week
 */
export const fetchTechnicianUtilisation = async (technicianId, week) => {
  try {
    const response = await api.get(`${BASE_URL}/technician?techId=${technicianId}&week=${week}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching utilisation for technician ${technicianId}:`, error);
    throw error;
  }
};

/**
 * Calculate bay occupancy for a date/time range
 */
export const calculateBayOccupancy = async (date, bayId = null) => {
  try {
    let url = `${BASE_URL}/occupancy?date=${date}`;
    if (bayId) url += `&bayId=${bayId}`;

    const response = await api.get(url);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error calculating occupancy:', error);
    throw error;
  }
};

/**
 * Get quick stats summary (overall health check)
 */
export const fetchQuickStats = async () => {
  try {
    const response = await api.get(`${BASE_URL}/quick`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    throw error;
  }
};

/**
 * Get overdue jobs count
 */
export const fetchOverdueCount = async () => {
  try {
    const response = await api.get(`${BASE_URL}/overdue-count`);
    return response.data.data?.count || 0;
  } catch (error) {
    console.error('Error fetching overdue count:', error);
    return 0;
  }
};

/**
 * Get awaiting parts jobs count
 */
export const fetchAwaitingPartsCount = async () => {
  try {
    const response = await api.get(`${BASE_URL}/awaiting-parts-count`);
    return response.data.data?.count || 0;
  } catch (error) {
    console.error('Error fetching awaiting parts count:', error);
    return 0;
  }
};

/**
 * Get job completion statistics (average, by type, etc.)
 */
export const fetchCompletionStats = async (startDate, endDate) => {
  try {
    const response = await api.get(`${BASE_URL}/completion?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching completion stats:', error);
    throw error;
  }
};

/**
 * Get revenue statistics
 */
export const fetchRevenueStats = async (startDate, endDate) => {
  try {
    const response = await api.get(`${BASE_URL}/revenue?startDate=${startDate}&endDate=${endDate}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    throw error;
  }
};

export default {
  fetchDayStats,
  fetchWeekStats,
  fetchMonthStats,
  fetchTechnicianUtilisation,
  calculateBayOccupancy,
  fetchQuickStats,
  fetchOverdueCount,
  fetchAwaitingPartsCount,
  fetchCompletionStats,
  fetchRevenueStats,
};
