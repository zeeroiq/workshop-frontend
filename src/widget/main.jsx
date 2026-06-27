if (typeof process === 'undefined') {
    window.process = { env: { NODE_ENV: 'production' } };
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import SiteIQWidget from './SiteIQWidget';

// Parse API key from script tag data attributes or global window object
let apiKey = window.SITEIQ_API_KEY;
let chatbotId = window.SITEIQ_CHATBOT_ID;

// Also allow extracting from the script tag itself if embedded
if (!apiKey || !chatbotId) {
    const currentScript = document.currentScript || document.querySelector('script[data-chatbot-id]');
    if (currentScript) {
        chatbotId = currentScript.getAttribute('data-chatbot-id');
        apiKey = currentScript.getAttribute('data-api-key');
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
    root.render(<SiteIQWidget chatbotId={chatbotId} apiKey={apiKey} />);
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWidget);
} else {
    mountWidget();
}
