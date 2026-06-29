import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatbot } from '@/hooks/siteiq/useChatbot';
import { useScrapeProgress } from '@/hooks/siteiq/useScrapeProgress';
import { useChatbotPages } from '@/hooks/siteiq/useChatbotPages';
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
import ScrapeProgressBar from './ScrapeProgressBar';
import AppearanceTab from './AppearanceTab';
import BehaviorTab from './BehaviorTab';
import AnalyticsTab from './AnalyticsTab';
import PaginationComponent from "@/components/common/PaginationComponent";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const ChatbotDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Core data hooks
    const { chatbot, loading: chatbotLoading, error: chatbotError, refetch: refetchChatbot, updateChatbot } = useChatbot(id);
    const { job, isRunning, progressRatio, statusMessage, error: progressError, triggerScrape } = useScrapeProgress(id);
    
    // Pages tab data hook
    const [currentPage, setCurrentPage] = useState(0);
    const { content: pages, page, loading: pagesLoading, deletePage } = useChatbotPages(id, {
        page: currentPage,
        size: 10,
        sort: 'createdAt,desc'
    });

    const [embedCode, setEmbedCode] = useState('');

    useEffect(() => {
        if (id) {
            chatbotApi.getEmbedCode(id).then(res => {
                setEmbedCode(res.embedCode || res);
            }).catch(console.error);
        }
    }, [id]);

    const handleStartScrape = async () => {
        try {
            await triggerScrape();
            toast.info('Scraping job queued.');
        } catch (e) {
            // Error handled in hook
        }
    };

    const handleDeletePage = async (pageId) => {
        if (!window.confirm("Are you sure you want to delete this page from the index?")) return;
        try {
            await deletePage(pageId);
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
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl">
                        <CardHeader className="border-b border-border/50 bg-muted/20 p-6 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                    <FileText size={18} className="text-emerald-500" /> Indexed Pages
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                                    Total: {page?.totalElements || 0} pages crawled
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {pagesLoading && pages?.length === 0 ? (
                                <div className="p-8 flex justify-center"><LoadingSpinner /></div>
                            ) : pages?.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center">
                                    <FileText size={48} className="text-muted-foreground/30 mb-4" />
                                    <h3 className="text-lg font-black mb-1">No pages indexed yet</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm mb-6">Click "Retrain Bot" above to start scraping your website and building the knowledge base.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/10">
                                            <TableRow className="border-border/50">
                                                <TableHead className="font-bold text-[10px] uppercase tracking-widest">URL</TableHead>
                                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-center">Status</TableHead>
                                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pages.map((p) => (
                                                <TableRow key={p.id} className="border-border/50 hover:bg-muted/10 transition-colors group">
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-foreground truncate max-w-[400px]" title={p.url}>
                                                                {p.url}
                                                            </span>
                                                            {p.title && <span className="text-xs text-muted-foreground truncate max-w-[400px]">{p.title}</span>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className={cn(
                                                            "text-[10px] font-bold uppercase tracking-widest",
                                                            p.status === 'SUCCESS' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                                                            p.status === 'FAILED' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
                                                            "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                        )}>
                                                            {p.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/10"
                                                            onClick={() => handleDeletePage(p.id)}
                                                            title="Delete from index"
                                                        >
                                                            <Trash size={14} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                            
                            {!pagesLoading && page?.totalPages > 1 && (
                                <div className="p-4 border-t border-border/50">
                                    <PaginationComponent
                                        currentPage={currentPage}
                                        totalPages={page.totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl">
                        <CardHeader className="border-b border-border/50 bg-muted/20 p-6">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Code size={18} className="text-emerald-500" /> Embed Widget
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                                Add the assistant to your website
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold">1. Copy the tracking snippet</h3>
                                <p className="text-xs text-muted-foreground">
                                    Paste this code inside the <code>&lt;head&gt;</code> tag or at the end of the <code>&lt;body&gt;</code> tag of your website.
                                </p>
                            </div>
                            
                            <div className="relative group">
                                <pre className="p-4 rounded-xl bg-slate-950 text-slate-50 overflow-x-hidden whitespace-pre-wrap break-words text-xs font-mono border border-border/50 leading-relaxed">
                                    {embedCode || 'Loading snippet...'}
                                </pre>
                                <Button 
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white border-none h-8 px-3 text-[10px] uppercase font-bold tracking-widest"
                                    onClick={() => {
                                        navigator.clipboard.writeText(embedCode);
                                        toast.success('Copied to clipboard');
                                    }}
                                >
                                    Copy Code
                                </Button>
                            </div>
                            
                            <div className="bg-blue-500/10 text-blue-600 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3 mt-4">
                                <Bot size={20} className="mt-0.5 shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold">Widget Configuration</h4>
                                    <p className="text-xs mt-1 opacity-90 leading-relaxed">
                                        The widget will automatically apply your defined Appearance and Behavior settings. If you update the configuration, changes will reflect instantly without needing to update the script on your site.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
