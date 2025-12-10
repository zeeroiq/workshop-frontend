export const isDevelopment = import.meta.env.VITE_APP_ENV === 'development';
export const isIntegration = import.meta.env.VITE_APP_ENV === 'integration';
export const isCertification = import.meta.env.VITE_APP_ENV === 'certification';
export const isProduction = import.meta.env.VITE_APP_ENV === 'production';

export const getEnvironment = () => import.meta.env.VITE_APP_ENV || 'development';
export const getApiUrl = () => import.meta.env.VITE_APP_API_URL;
export const getVersion = () => import.meta.env.VITE_APP_VERSION;

// Debug logging only in development
export const debugLog = (...args) => {
    if (import.meta.env.VITE_APP_DEBUG === 'true') {
        console.log(...args);
    }
};

// Error logging in all environments except production
export const errorLog = (...args) => {
    if (!isProduction) {
        console.error(...args);
    }
};