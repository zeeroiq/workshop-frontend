import { useState, useEffect, useCallback } from 'react';
import { chatbotApi } from '../../services/siteiq/chatbotApi';
import { toast } from 'react-toastify';

export const useChatbots = (params = {}) => {
    const [data, setData] = useState({ content: [], page: { number: 0, size: 20, totalElements: 0, totalPages: 0 } });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchChatbots = useCallback(async (queryParams = params) => {
        setLoading(true);
        setError(null);
        try {
            const res = await chatbotApi.list(queryParams);
            setData(res.data || res); // Depending on how backend returns paginated data (usually Spring Data returns {content: [], page: {...}})
        } catch (err) {
            console.error('[SiteIQ] Error fetching chatbots', err);
            setError(err);
            toast.error('Failed to load chatbots.');
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect(() => {
        fetchChatbots();
    }, [fetchChatbots]);

    const removeChatbot = async (id) => {
        try {
            await chatbotApi.remove(id);
            fetchChatbots(); // Refresh list
            return true;
        } catch (err) {
            console.error('[SiteIQ] Error deleting chatbot', err);
            toast.error('Failed to delete chatbot.');
            throw err;
        }
    };

    return { ...data, loading, error, refetch: fetchChatbots, removeChatbot };
};
