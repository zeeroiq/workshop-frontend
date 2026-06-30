import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatbot } from '@/hooks/siteiq/useChatbot';
import { useScrapeProgress } from '@/hooks/siteiq/useScrapeProgress';
import { chatbotApi } from '@/services/siteiq/chatbotApi';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Bot,
    Play,
    Settings2,
    Palette,
    Code,
    BarChart3,
    FileText,
    ExternalLink,
    ArrowLeft,
    Trash,
    Globe,
    Loader2
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ChatbotStatusBadge from './ChatbotStatusBadge';
import AppearanceTab from './AppearanceTab';
import BehaviorTab from './BehaviorTab';
import AnalyticsTab from './AnalyticsTab';
import PagesTab from './PagesTab';
import EmbedApiTab from './EmbedApiTab';
import ScrapeProgressBar from "@/components/siteiq/ScrapeProgressBar";

const ChatbotDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Core data hooks
    const { chatbot, loading: chatbotLoading, error: chatbotError, refetch: refetchChatbot, updateChatbot } = useChatbot(id);
    const { job, isRunning, progressRatio, statusMessage, error: progressError, triggerScrape } = useScrapeProgress(id);

    const handleStartScrape = async () => {
        try {
            await triggerScrape();
            toast.info('Scraping job queued.');
        } catch (e) {
            // Error handled in hook
        }
    };

    if (chatbotLoading) {
        return <div className="flex items-center justify-center h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;
    }

    if (!chatbot || chatbotError) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] gap-4 text-center">
                <Bot size={48} className="text-muted-foreground/30" />
                <div className="space-y-1">
                    <h2 className="text-xl font-black">Chatbot Not Found</h2>
                    <p className="text-sm text-muted-foreground">The AI assistant you're looking for doesn't exist or has been deleted.</p>
                </div>
                <Button onClick={() => navigate('/siteiq/chatbots')} variant="outline" className="mt-4">
                    <ArrowLeft className="mr-2" size={16} /> Back to Directory
                </Button>
            </div>
        );
    }

    // Determine derived status
    const displayStatus = isRunning ? 'SCRAPING' : chatbot.status;

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 pb-10 pr-6 md:pr-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/siteiq/chatbots')} className="h-6 w-6 rounded-full -ml-2 text-muted-foreground hover:text-foreground">
                            <ArrowLeft size={14} />
                        </Button>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500/80">SiteIQ Assistant</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black text-foreground tracking-tight">{chatbot.name}</h1>
                        <ChatbotStatusBadge status={displayStatus} className="mt-1" />
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm md:text-base">
                        <Globe size={14} className="text-emerald-500" />
                        <a href={chatbot.seedUrl} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 hover:underline transition-colors">
                            {chatbot.seedUrl}
                        </a>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={handleStartScrape} 
                        disabled={isRunning}
                        className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        {isRunning ? (
                            <><Loader2 size={16} className="mr-2 animate-spin" /> Scraping...</>
                        ) : (
                            <><Play size={16} className="mr-2 fill-current" /> Retrain Bot</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Global Scrape Progress Bar */}
            <ScrapeProgressBar 
                isRunning={isRunning} 
                progressRatio={progressRatio} 
                statusMessage={statusMessage} 
                error={progressError} 
            />

            {/* Main Content Tabs */}
            <Tabs defaultValue="pages" className="w-full">
                <TabsList className="w-full justify-start h-14 bg-muted/20 p-1 border border-border/50 rounded-xl mb-6 overflow-x-auto">
                    <TabsTrigger value="pages" className="h-10 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-emerald-500 data-[state=active]:shadow-sm px-6">
                        <FileText size={16} className="mr-2" /> Data Sources
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="h-10 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-emerald-500 data-[state=active]:shadow-sm px-6">
                        <Palette size={16} className="mr-2" /> Appearance
                    </TabsTrigger>
                    <TabsTrigger value="behavior" className="h-10 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-emerald-500 data-[state=active]:shadow-sm px-6">
                        <Settings2 size={16} className="mr-2" /> Behavior
                    </TabsTrigger>
                    <TabsTrigger value="embed" className="h-10 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-emerald-500 data-[state=active]:shadow-sm px-6">
                        <Code size={16} className="mr-2" /> Embed & API
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="h-10 rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-emerald-500 data-[state=active]:shadow-sm px-6">
                        <BarChart3 size={16} className="mr-2" /> Analytics
                    </TabsTrigger>
                </TabsList>

                {/* Pages Tab */}
                <TabsContent value="pages" className="space-y-6 mt-0 border-none outline-none">
                    <PagesTab chatbotId={chatbot?.id} />
                </TabsContent>

                {/* Appearance Tab */}
                <TabsContent value="appearance" className="space-y-6 mt-0 border-none outline-none">
                    <AppearanceTab chatbot={chatbot} onUpdate={updateChatbot} />
                </TabsContent>

                {/* Behavior Tab */}
                <TabsContent value="behavior" className="space-y-6 mt-0 border-none outline-none">
                    <BehaviorTab chatbot={chatbot} onUpdate={updateChatbot} />
                </TabsContent>

                {/* Embed Tab */}
                <TabsContent value="embed" className="space-y-6 mt-0 border-none outline-none">
                    <EmbedApiTab chatbotId={chatbot?.id} />
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6 mt-0 border-none outline-none">
                    <AnalyticsTab chatbotId={chatbot?.id} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ChatbotDetailPage;
