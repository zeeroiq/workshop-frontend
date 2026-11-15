import React, {useEffect, useState} from 'react';
import {workshopBotService} from '@/services/siteiq/workshopBotService';
import SiteIQWidget from '@/widget/SiteIQWidget';

const ChatbotWidgetLoader = () => {
    const [activeBot, setActiveBot] = useState(() => workshopBotService.getActiveBot());

    useEffect(() => {
        const handleChatbotUpdate = (e) => {
            const detail = e.detail;
            if (detail && detail.enabled && detail.chatbotId && detail.apiKey) {
                setActiveBot(detail);
            } else {
                setActiveBot(null);
            }
        };

        const handleStorageChange = (e) => {
            if (e.key === 'siteiq_workshop_active_bot') {
                setActiveBot(workshopBotService.getActiveBot());
            }
        };

        window.addEventListener('workshop-chatbot-updated', handleChatbotUpdate);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('workshop-chatbot-updated', handleChatbotUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    if (!activeBot || !activeBot.enabled || !activeBot.chatbotId || !activeBot.apiKey) {
        return null;
    }

    return (
        <SiteIQWidget
            key={`${activeBot.chatbotId}-${activeBot.apiKey}`}
            chatbotId={activeBot.chatbotId}
            apiKey={activeBot.apiKey}
        />
    );
};

export default ChatbotWidgetLoader;
