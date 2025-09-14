export const isDevelopment = process.env.REACT_APP_ENV === 'development';
export const isIntegration = process.env.REACT_APP_ENV === 'integration';
export const isCertification = process.env.REACT_APP_ENV === 'certification';
export const isProduction = process.env.REACT_APP_ENV === 'production';

export const getEnvironment = () => process.env.REACT_APP_ENV || 'development';
export const getApiUrl = () => process.env.REACT_APP_API_URL;
export const getVersion = () => process.env.REACT_APP_VERSION;

// Debug logging only in development
export const debugLog = (...args) => {
    if (process.env.REACT_APP_DEBUG === 'true') {
        console.log(...args);
    }
};

// Error logging in all environments except production
export const errorLog = (...args) => {
    if (!isProduction) {
        console.error(...args);
    }
};