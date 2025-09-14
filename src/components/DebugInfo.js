import React from 'react';

const DebugInfo = () => {
    return (
        <div style={{ padding: '10px', background: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
            <strong>Environment:</strong> {process.env.REACT_APP_ENV} |
            <strong> API URL:</strong> {process.env.REACT_APP_API_URL} |
            <strong> Build Date:</strong> {new Date().toLocaleString()}
        </div>
    );
};

export default DebugInfo;