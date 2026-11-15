import { useState, useEffect, useCallback } from 'react';
import { chatbotApi } from '../../services/siteiq/chatbotApi';
import { toast } from 'react-toastify';

export const useChatbotPages = (chatbotId, initialParams = {}) => {
    const [data, setData] = useState({ content: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPages = useCallback(async (params = initialParams) => {
        if (!chatbotId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await chatbotApi.listPages(chatbotId, params);
            setData(res.data || res);
        } catch (err) {
            console.error(`[SiteIQ] Error fetching pages for chatbot ${chatbotId}`, err);
            setError(err);
            toast.error('Failed to load scraped pages.');
        } finally {
            setLoading(false);
        }
    }, [chatbotId, JSON.stringify(initialParams)]);

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    const deletePage = async (pageId) => {
        try {
            await chatbotApi.deletePage(chatbotId, pageId);
            toast.success('Page deleted successfully.');
            fetchPages();
            return true;
        } catch (err) {
            console.error(`[SiteIQ] Error deleting page ${pageId}`, err);
            toast.error('Failed to delete page.');
            throw err;
        }
    };

    return { ...data, loading, error, refetch: fetchPages, deletePage };
};
