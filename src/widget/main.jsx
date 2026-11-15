if (typeof process === 'undefined') {
    window.process = { env: { NODE_ENV: 'production' } };
}

import React from 'react';
import {createRoot} from 'react-dom/client';
import SiteIQWidget from './SiteIQWidget';

let currentRoot = null;

export const destroy = () => {
    if (currentRoot) {
        try {
            currentRoot.unmount();
        } catch (e) {
            console.warn("Failed to unmount SiteIQWidget", e);
        }
        currentRoot = null;
    }
    const container = document.getElementById('siteiq-widget-root');
    if (container) {
        container.remove();
    }
};

export const init = (options = {}) => {
    let cid = options.chatbotId || window.SITEIQ_CHATBOT_ID;
    let key = options.apiKey || window.SITEIQ_API_KEY;

    if (!cid || !key) {
        const currentScript = document.currentScript || document.querySelector('script[data-chatbot-id]');
        if (currentScript) {
            cid = cid || currentScript.getAttribute('data-chatbot-id');
            key = key || currentScript.getAttribute('data-api-key');
        }
    }

    if (!cid || !key) {
        return;
    }

    destroy();

    const container = document.createElement('div');
    container.id = 'siteiq-widget-root';
    document.body.appendChild(container);

    currentRoot = createRoot(container);
    currentRoot.render(<SiteIQWidget chatbotId={cid} apiKey={key}/>);
};

// Expose globally on window
window.SiteIQ = {init, destroy};

// Auto-mount if script attributes or global variables are already set
const autoMount = () => {
    const hasScriptConfig = document.querySelector('script[data-chatbot-id]') != null;
    if (window.SITEIQ_CHATBOT_ID || hasScriptConfig) {
        init();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
} else {
    autoMount();
}
