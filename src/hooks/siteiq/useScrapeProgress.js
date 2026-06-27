import { useState, useEffect } from 'react';
import { chatbotApi } from '../../services/siteiq/chatbotApi';
import { openScrapeProgressStream } from '../../services/siteiq/sseClient';

export const useScrapeProgress = (chatbotId) => {
    const [job, setJob] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [progressRatio, setProgressRatio] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!chatbotId) return;

        let cleanup = null;

        const checkActiveJob = async () => {
            try {
                const res = await chatbotApi.getActiveJob(chatbotId);
                const activeJob = res.data || res;
                if (activeJob && (activeJob.status === 'PENDING' || activeJob.status === 'RUNNING' || activeJob.status === 'SCRAPING')) {
                    setJob(activeJob);
                    setIsRunning(true);
                    
                    cleanup = openScrapeProgressStream(chatbotId, activeJob.id, {
                        onProgress: (data) => {
                            setJob(prev => ({ ...prev, ...data }));
                            if (data.progressRatio !== undefined) {
                                setProgressRatio(data.progressRatio);
                            } else if (data.totalUrls && data.scrapedUrls !== undefined) {
                                setProgressRatio(data.scrapedUrls / data.totalUrls);
                            }
                            if (data.message) {
                                setStatusMessage(data.message);
                            }
                        },
                        onComplete: (data) => {
                            setIsRunning(false);
                            setJob(prev => ({ ...prev, status: data.status }));
                            setStatusMessage(data.message || 'Scraping completed');
                            if (data.progressRatio !== undefined) setProgressRatio(data.progressRatio);
                        },
                        onError: (err) => {
                            console.error('[SiteIQ] SSE Error', err);
                            setIsRunning(false);
                            setError(err);
                            setStatusMessage('Lost connection to progress stream');
                        }
                    });
                } else {
                    setIsRunning(false);
                    setJob(activeJob || null);
                }
            } catch (err) {
                // Not found (404) or other error means no active job typically
                setIsRunning(false);
            }
        };

        checkActiveJob();

        return () => {
            if (cleanup) cleanup();
        };
    }, [chatbotId]);

    const triggerScrape = async (opts = {}) => {
        try {
            setError(null);
            const res = await chatbotApi.startScrape(chatbotId, opts);
            const newJob = res.data || res;
            setJob(newJob);
            setIsRunning(true);
            setProgressRatio(0);
            setStatusMessage('Starting scrape...');
            
            // Wait a moment and then checkActiveJob logic will pick it up or we can open SSE here.
            // Since we want auto-connect, let's just trigger a re-render of the effect by setting state?
            // Actually, the easiest is to just manually open SSE here or let the user refresh/re-mount.
            // For simplicity, we just rely on a page reload or we can manually hook SSE.
            const cleanup = openScrapeProgressStream(chatbotId, newJob.id, {
                onProgress: (data) => {
                    setJob(prev => ({ ...prev, ...data }));
                    if (data.progressRatio !== undefined) {
                        setProgressRatio(data.progressRatio);
                    } else if (data.totalUrls && data.scrapedUrls !== undefined) {
                        setProgressRatio(data.scrapedUrls / data.totalUrls);
                    }
                    if (data.message) {
                        setStatusMessage(data.message);
                    }
                },
                onComplete: (data) => {
                    setIsRunning(false);
                    setJob(prev => ({ ...prev, status: data.status }));
                    setStatusMessage(data.message || 'Scraping completed');
                    if (data.progressRatio !== undefined) setProgressRatio(data.progressRatio);
                },
                onError: (err) => {
                    console.error('[SiteIQ] SSE Error', err);
                    setIsRunning(false);
                    setError(err);
                    setStatusMessage('Lost connection to progress stream');
                }
            });
            
            return { job: newJob, cleanup };
        } catch (err) {
            console.error('[SiteIQ] Failed to start scrape', err);
            setError(err);
            throw err;
        }
    };

    return { job, isRunning, progressRatio, statusMessage, error, triggerScrape };
};
