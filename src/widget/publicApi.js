import axios from 'axios';

// Get base URL relative to where the widget script is loaded from, or fallback to current origin
const getBaseUrl = () => {
    // If the widget is embedded in another site, we need the origin of the script tag
    if (typeof document !== 'undefined') {
        const script = document.querySelector('script[src*="widget.js"]');
        if (script && script.src) {
            const url = new URL(script.src);
            return `${url.origin}/api/siteiq/widget`;
        }
    }
    // Fallback
    return 'http://localhost:8080/api/siteiq/widget';
};

const createPublicApi = (apiKey) => {
    const baseURL = getBaseUrl();
    const instance = axios.create({
        baseURL,
        headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json'
        }
    });

    return {
        getChatbotConfig: () => instance.get('/config').then(res => res.data),
        createSession: () => instance.post('/sessions').then(res => res.data),
        sendMessage: (sessionId, content) => instance.post(`/sessions/${sessionId}/messages`, { content }).then(res => res.data),
        
        // SSE for streaming response
        streamMessage: (sessionId, content, onMessage, onError, onComplete) => {
            const url = `${baseURL}/sessions/${sessionId}/messages/stream`;
            
            return new Promise((resolve, reject) => {
                const abortController = new AbortController();
                
                // First POST the message
                instance.post(`/sessions/${sessionId}/messages`, { content })
                    .then(response => {
                        const messageId = response.data?.id;
                        
                        // Then listen to the stream
                        const eventSource = new EventSource(`${url}?apiKey=${apiKey}`, { withCredentials: false });
                        
                        eventSource.onmessage = (event) => {
                            try {
                                const data = JSON.parse(event.data);
                                if (data.status === 'COMPLETED' || data.status === 'ERROR') {
                                    eventSource.close();
                                    if (data.status === 'ERROR') {
                                        onError?.(new Error(data.error));
                                        reject(new Error(data.error));
                                    } else {
                                        onComplete?.();
                                        resolve();
                                    }
                                } else if (data.contentDelta) {
                                    onMessage?.(data.contentDelta);
                                }
                            } catch (e) {
                                console.error('Error parsing SSE', e);
                            }
                        };
                        
                        eventSource.onerror = (err) => {
                            console.error('SSE Error', err);
                            eventSource.close();
                            onError?.(err);
                            reject(err);
                        };
                        
                        abortController.signal.addEventListener('abort', () => {
                            eventSource.close();
                        });
                    })
                    .catch(err => {
                        onError?.(err);
                        reject(err);
                    });
                    
                return abortController;
            });
        }
    };
};

export default createPublicApi;
