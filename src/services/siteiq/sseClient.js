import { authService } from '../authService';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || '';

export const openScrapeProgressStream = (chatbotId, jobId, { onProgress, onComplete, onError }) => {
    const token = authService.getToken();
    let hasReconnected = false;
    let es = null;

    const connect = () => {
        if (es) {
            es.close();
        }
        
        const url = `${API_BASE_URL}/chatbots/${chatbotId}/scrape/${jobId}/status?token=${encodeURIComponent(token)}`;
        es = new EventSource(url);

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.status === 'COMPLETED' || data.status === 'ERROR') {
                    onComplete?.(data);
                    es.close();
                } else {
                    onProgress?.(data);
                }
            } catch (e) {
                console.warn('[SiteIQ] Error parsing SSE message', e);
            }
        };

        es.onerror = (err) => {
            if (!hasReconnected) {
                hasReconnected = true;
                console.warn('[SiteIQ] SSE connection dropped, retrying in 3s...');
                setTimeout(connect, 3000);
            } else {
                onError?.(err);
                es.close();
            }
        };
    };

    connect();

    return () => {
        if (es) {
            es.close();
        }
    };
};

export const openChatStream = (chatbotId, apiKey, body, { onToken, onDone, onError }) => {
    const controller = new AbortController();
    const url = `${API_BASE_URL}/siteiq/public/widget/v1/${chatbotId}/chat`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
    }).then(async (res) => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

            for (let line of lines) {
                line = line.trim();
                if (line.startsWith('data:')) {
                    const dataStr = line.slice(5).trim();
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.done) {
                            onDone?.(data);
                        } else {
                            onToken?.(data);
                        }
                    } catch (e) {
                        console.warn('[SiteIQ] Parse error in chat stream', e);
                    }
                } else if (line.startsWith('event:')) {
                    const eventType = line.slice(6).trim();
                    if (eventType === 'error') {
                        // The next line should be data: containing the error
                        // We will handle it when processing data:
                    }
                }
            }
        }
    }).catch(err => {
        if (err.name !== 'AbortError') {
            onError?.(err);
        }
    });

    return controller;
};
