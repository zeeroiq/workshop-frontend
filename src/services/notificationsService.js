import api from './api';

/**
 * Notifications Service
 * API calls for customer notifications, internal alerts, and templates
 */

const BASE_URL = '/notifications';

/**
 * Send notification to customer
 */
export const sendCustomerNotification = async (jobId, notificationType, options = {}) => {
  try {
    const response = await api.post(`${BASE_URL}/send`, {
      jobId,
      type: notificationType,
      ...options,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error sending notification for job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Send custom SMS to customer
 */
export const sendCustomerSMS = async (jobId, message, phoneNumber = null) => {
  try {
    const response = await api.post(`${BASE_URL}/sms`, {
      jobId,
      message,
      phoneNumber,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error sending SMS for job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Send custom email to customer
 */
export const sendCustomerEmail = async (jobId, subject, body, email = null) => {
  try {
    const response = await api.post(`${BASE_URL}/email`, {
      jobId,
      subject,
      body,
      email,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error sending email for job ${jobId}:`, error);
    throw error;
  }
};

/**
 * Fetch notification templates (predefined messages)
 */
export const fetchNotificationTemplates = async () => {
  try {
    const response = await api.get(`${BASE_URL}/templates`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching notification templates:', error);
    throw error;
  }
};

/**
 * Update notification template
 */
export const updateNotificationTemplate = async (templateType, content) => {
  try {
    const response = await api.put(`${BASE_URL}/templates/${templateType}`, {
      content,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating template ${templateType}:`, error);
    throw error;
  }
};

/**
 * Fetch notifications for current user
 */
export const fetchNotifications = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.unreadOnly) params.append('unreadOnly', 'true');
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const response = await api.get(`${BASE_URL}?${params.toString()}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`${BASE_URL}/${notificationId}/read`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch(`${BASE_URL}/read-all`);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 */
export const fetchUnreadCount = async () => {
  try {
    const response = await api.get(`${BASE_URL}/unread-count`);
    return response.data.data?.count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`${BASE_URL}/${notificationId}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error deleting notification ${notificationId}:`, error);
    throw error;
  }
};

/**
 * Send bulk notifications
 */
export const sendBulkNotifications = async (jobIds, notificationType, options = {}) => {
  try {
    const response = await api.post(`${BASE_URL}/send-bulk`, {
      jobIds,
      type: notificationType,
      ...options,
    });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
};

export default {
  sendCustomerNotification,
  sendCustomerSMS,
  sendCustomerEmail,
  fetchNotificationTemplates,
  updateNotificationTemplate,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  fetchUnreadCount,
  deleteNotification,
  sendBulkNotifications,
};
