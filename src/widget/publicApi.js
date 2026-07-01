import axios from 'axios';

// Get base URL relative to where the widget script is loaded from, or fallback to current origin
const getBaseUrl = () => {
    // If the widget is embedded in another site, we need the origin of the script tag
    if (typeof document !== 'undefined') {
        const script = document.querySelector('script[src*="widget.js"]');
        if (script && script.src) {
            const url = new URL(script.src);
            return `${url.origin}/api/siteiq/public/widget/v1`;
        }
    }
    // Fallback
    return 'http://localhost:8080/api/siteiq/public/widget/v1';
};

const createPublicApi = (chatbotId, apiKey) => {
    const baseURL = getBaseUrl();
    const instance = axios.create({
        baseURL,
        headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json'
        }
    });

    return {
        // Fetch public config
        getChatbotConfig: () => instance.get(`/${chatbotId}/config`).then(res => res.data),
        
        // Mock session creation locally since backend doesn't require a dedicated session init endpoint
        createSession: () => Promise.resolve({ id: crypto.randomUUID() }),
        
        // SSE for streaming response using native fetch API to handle stream robustly
        streamMessage: (sessionId, content, email, onMessage, onError, onComplete) => {
            return new Promise(async (resolve, reject) => {
                const abortController = new AbortController();
                
                try {
                    const response = await fetch(`${baseURL}/${chatbotId}/chat`, {
                        method: 'POST',
                        headers: {
                            'X-Api-Key': apiKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ sessionId, message: content, email: email || undefined }),
                        signal: abortController.signal
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    
                    let done = false;
                    while (!done) {
                        const { value, done: readerDone } = await reader.read();
                        done = readerDone;
                        if (value) {
                            const chunk = decoder.decode(value, { stream: true });
                            const lines = chunk.split('\n');
                            
                            for (const line of lines) {
                                if (line.startsWith('data:')) {
                                    const dataStr = line.replace('data:', '').trim();
                                    if (!dataStr) continue;
                                    
                                    try {
                                        const parsed = JSON.parse(dataStr);
                                        // Support the backend's ChatToken signature: token, done, sources
                                        if (parsed.done) {
                                            onComplete?.(parsed.sources);
                                            resolve();
                                            return;
                                        } else {
                                            onMessage?.(parsed.token || '');
                                        }
                                    } catch (e) {
                                        console.error('Error parsing SSE data', e, dataStr);
                                    }
                                } else if (line.startsWith('event: error')) {
                                    throw new Error('Server returned stream error event');
                                }
                            }
                        }
                    }
                    onComplete?.();
                    resolve();
                } catch (err) {
                    if (err.name === 'AbortError') {
                        console.log('Stream aborted by client');
                    } else {
                        console.error('Stream error:', err);
                        onError?.(err);
                        reject(err);
                    }
                }
                
                return abortController;
            });
        },
        
        // Submit feedback for a message
        submitFeedback: (messageId, feedbackValue) => {
            return instance.post(`/${chatbotId}/feedback`, {
                messageId,
                feedback: feedbackValue
            });
        }
    };
};

export default createPublicApi;
