import { authService } from '@/services/authService';

/**
 * Appends the authentication token to storage URLs for direct browser loading (e.g., <img> tags)
 * @param {string} url - The storage URL (relative or absolute)
 * @returns {string} - The URL with the token appended
 */
export const getAuthenticatedUrl = (url) => {
    if (!url) return url;
    
    // Only append token for our storage view endpoint
    if (url.includes('/storage/view')) {
        const token = authService.getToken();
        if (token) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}token=${token}`;
        }
    }
    
    return url;
};
