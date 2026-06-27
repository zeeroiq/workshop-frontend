import React from 'react';
import { createRoot } from 'react-dom/client';
import SiteIQWidget from './SiteIQWidget';

// Parse API key from script tag data attributes or global window object
let apiKey = window.SITEIQ_API_KEY;

// Also allow extracting from the script tag itself if embedded
if (!apiKey) {
    const currentScript = document.currentScript || document.querySelector('script[data-chatbot-id]');
    if (currentScript) {
        apiKey = currentScript.getAttribute('data-chatbot-id') || currentScript.getAttribute('data-api-key');
    }
}

const mountWidget = () => {
    // Prevent multiple initializations
    if (document.getElementById('siteiq-widget-root')) {
        return;
    }

    const container = document.createElement('div');
    container.id = 'siteiq-widget-root';
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(<SiteIQWidget apiKey={apiKey} />);
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWidget);
} else {
    mountWidget();
}
