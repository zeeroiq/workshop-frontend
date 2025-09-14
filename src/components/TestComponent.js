import React from 'react';

const TestComponent = () => {
    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h1>Workshop Management System</h1>
            <p>If you can see this, React is working!</p>
            <button onClick={() => alert('React is working!')}>
                Test Button
            </button>
        </div>
    );
};

export default TestComponent;