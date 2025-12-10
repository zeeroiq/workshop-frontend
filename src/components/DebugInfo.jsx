import React from 'react';

const DebugInfo = () => {
    return (
        <div style={{ padding: '10px', background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
            <strong>Environment:</strong> {import.meta.env.VITE_APP_ENV} |
            <strong> API URL:</strong> {import.meta.env.VITE_APP_API_URL} |
            <strong> Build Date:</strong> {new Date().toLocaleString()}
        </div>
    );
};

export default DebugInfo;