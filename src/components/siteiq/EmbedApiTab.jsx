import React, { useState, useEffect } from 'react';
import { 
    Code, 
    Bot, 
    Key, 
    RefreshCw, 
    Eye, 
    EyeOff, 
    Copy, 
    Check,
    AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { chatbotApi } from '@/services/siteiq/chatbotApi';
import LoadingSpinner from '../common/LoadingSpinner';

const EmbedApiTab = ({ chatbotId }) => {
    const [embedCode, setEmbedCode] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [copiedEmbed, setCopiedEmbed] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    const fetchData = async () => {
        if (!chatbotId) return;
        setLoading(true);
        try {
            const [embedRes, apiKeyRes] = await Promise.all([
                chatbotApi.getEmbedCode(chatbotId),
                chatbotApi.getApiKey(chatbotId)
            ]);
            setEmbedCode(embedRes.embedCode || embedRes);
            setApiKey(apiKeyRes.apiKey || apiKeyRes);
        } catch (error) {
            console.error("Failed to load embed and API data:", error);
            toast.error("Failed to load API details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [chatbotId]);

    const handleRegenerateKey = async () => {
        if (!window.confirm("Are you sure you want to regenerate the API key? Any existing widgets or API integrations using the old key will stop working immediately until they are updated.")) {
            return;
        }
        
        setRegenerating(true);
        try {
            const res = await chatbotApi.regenerateKey(chatbotId);
            setApiKey(res.apiKey || res);
            toast.success('API Key regenerated successfully');
            
            // Also refresh embed code as it contains the key
            const embedRes = await chatbotApi.getEmbedCode(chatbotId);
            setEmbedCode(embedRes.embedCode || embedRes);
        } catch (error) {
            console.error("Failed to regenerate API key:", error);
            toast.error("Failed to regenerate API key");
        } finally {
            setRegenerating(false);
        }
    };

    const handleCopy = (text, type) => {
        navigator.clipboard.writeText(text);
        if (type === 'embed') {
            setCopiedEmbed(true);
            setTimeout(() => setCopiedEmbed(false), 2000);
        } else {
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><LoadingSpinner /></div>;
    }

    return (
        <div className="space-y-6">
            {/* Embed Widget Section */}
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
                            onClick={() => handleCopy(embedCode, 'embed')}
                        >
                            {copiedEmbed ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                            {copiedEmbed ? 'Copied' : 'Copy Code'}
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

            {/* API Key Management Section */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl">
                <CardHeader className="border-b border-border/50 bg-muted/20 p-6">
                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <Key size={18} className="text-rose-500" /> API Key Management
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                        Manage authentication for direct API access
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div className="space-y-2 flex-grow max-w-xl">
                                <h3 className="text-sm font-bold">Secret API Key</h3>
                                <p className="text-xs text-muted-foreground">
                                    Use this key to authenticate requests to the SiteIQ REST API. Send it in the <code>X-Api-Key</code> header. Do not expose this key in public client-side code (other than the official embed widget, which restricts access by domain).
                                </p>
                                
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="relative flex-grow">
                                        <div className="h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-mono flex items-center overflow-hidden whitespace-nowrap">
                                            {showKey ? apiKey : '•'.repeat(Math.min(apiKey.length || 32, 40))}
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => setShowKey(!showKey)}
                                        title={showKey ? "Hide API Key" : "Show API Key"}
                                    >
                                        {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => handleCopy(apiKey, 'key')}
                                        title="Copy API Key"
                                    >
                                        {copiedKey ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    </Button>
                                </div>
                            </div>
                            
                            <Button 
                                variant="destructive" 
                                onClick={handleRegenerateKey}
                                disabled={regenerating}
                                className="h-10 shrink-0 font-bold text-xs uppercase tracking-widest bg-rose-500 hover:bg-rose-600"
                            >
                                {regenerating ? (
                                    <RefreshCw size={14} className="mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw size={14} className="mr-2" />
                                )}
                                Regenerate Key
                            </Button>
                        </div>
                    </div>

                    <div className="bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 mt-4">
                        <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-sm font-bold">Warning</h4>
                            <p className="text-xs mt-1 opacity-90 leading-relaxed">
                                Regenerating your API key will immediately invalidate the current key. You must update your embed scripts and any backend integrations with the new key, otherwise requests will be rejected with a 401 Unauthorized error.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default EmbedApiTab;
