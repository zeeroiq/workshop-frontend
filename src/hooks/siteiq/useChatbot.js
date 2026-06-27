import { useState, useEffect, useCallback } from 'react';
import { chatbotApi } from '../../services/siteiq/chatbotApi';
import { toast } from 'react-toastify';

export const useChatbot = (id) => {
    const [chatbot, setChatbot] = useState(null);
    const [loading, setLoading] = useState(!!id);
    const [error, setError] = useState(null);

    const fetchChatbot = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const res = await chatbotApi.get(id);
            setChatbot(res.data || res);
        } catch (err) {
            console.error(`[SiteIQ] Error fetching chatbot ${id}`, err);
            setError(err);
            toast.error('Failed to load chatbot details.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchChatbot();
    }, [fetchChatbot]);

    const updateChatbot = async (body) => {
        try {
            const res = await chatbotApi.update(id, body);
            const updated = res.data || res;
            // Optimistic update
            setChatbot(updated);
            toast.success('Chatbot updated successfully.');
            return updated;
        } catch (err) {
            console.error(`[SiteIQ] Error updating chatbot ${id}`, err);
            toast.error('Failed to update chatbot.');
            throw err;
        }
    };

    return { chatbot, loading, error, refetch: fetchChatbot, updateChatbot };
};
