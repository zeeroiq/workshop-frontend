const STORAGE_KEY = 'siteiq_workshop_active_bot';

export const workshopBotService = {
    getActiveBot: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('Failed to read active bot from storage', e);
            return null;
        }
    },

    isBotActive: (chatbotId) => {
        if (!chatbotId) return false;
        const current = workshopBotService.getActiveBot();
        return current && current.chatbotId === chatbotId && current.enabled === true;
    },

    setActiveBot: (chatbotId, apiKey, name) => {
        const config = {
            chatbotId,
            apiKey,
            name: name || 'Workshop Assistant',
            enabled: true,
            updatedAt: new Date().toISOString()
        };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (e) {
            console.warn('Failed to save active bot to storage', e);
        }
        window.dispatchEvent(new CustomEvent('workshop-chatbot-updated', {detail: config}));
        return config;
    },

    deactivateBot: () => {
        const current = workshopBotService.getActiveBot();
        const config = current ? {...current, enabled: false} : {enabled: false};
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (e) {
            console.warn('Failed to update active bot storage', e);
        }
        window.dispatchEvent(new CustomEvent('workshop-chatbot-updated', {detail: {enabled: false}}));
        return config;
    },

    toggleBotActive: async (chatbotId, apiKey, name, chatbotApi) => {
        if (workshopBotService.isBotActive(chatbotId)) {
            workshopBotService.deactivateBot();
            return false;
        } else {
            let key = apiKey;
            if (!key && chatbotApi) {
                try {
                    const res = await chatbotApi.getApiKey(chatbotId);
                    key = res.apiKey || res;
                } catch (e) {
                    console.error('Failed to fetch API key for chatbot', e);
                }
            }
            if (!key) {
                throw new Error('API key is required to activate the chatbot widget');
            }
            workshopBotService.setActiveBot(chatbotId, key, name);
            return true;
        }
    }
};
