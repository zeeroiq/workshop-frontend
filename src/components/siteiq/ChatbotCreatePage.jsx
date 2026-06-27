import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatbotApi } from '@/services/siteiq/chatbotApi';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Save, Globe, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatbotCreatePage = () => {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [chatbot, setChatbot] = useState({
        name: '',
        seedUrl: '',
        allowedDomains: []
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!chatbot.name.trim()) newErrors.name = 'Name is required';
        if (!chatbot.seedUrl.trim()) {
            newErrors.seedUrl = 'Website URL is required';
        } else {
            try {
                new URL(chatbot.seedUrl);
            } catch (e) {
                newErrors.seedUrl = 'Please enter a valid URL (e.g. https://example.com)';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setChatbot(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        setSaving(true);
        try {
            const res = await chatbotApi.create(chatbot);
            toast.success('Chatbot created successfully.');
            // res contains the created chatbot
            const createdId = res?.id || res?.data?.id;
            if (createdId) {
                navigate(`/siteiq/chatbots/${createdId}`);
            } else {
                navigate('/siteiq/chatbots');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create chatbot';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 pb-10 pr-6 md:pr-10">
            <div className="flex flex-col gap-2 pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500/80">SiteIQ Platform</span>
                </div>
                <h1 className="text-4xl font-black text-foreground tracking-tight">Create AI Assistant</h1>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Train a new AI assistant on your website content to engage with customers.</p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-border/50 bg-muted/20 p-8">
                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <Bot size={18} className="text-emerald-500" /> Basic Configuration
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Define your assistant's identity and training source</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Assistant Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g. Support Bot"
                                    value={chatbot.name}
                                    onChange={handleChange}
                                    disabled={saving}
                                    className={cn(
                                        "h-12 bg-background/50 border-border/50 rounded-xl px-4 font-bold focus-visible:ring-emerald-500",
                                        errors.name && "border-rose-500 focus-visible:ring-rose-500"
                                    )}
                                />
                                {errors.name && <p className="text-xs font-bold text-rose-500 mt-1">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="seedUrl" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Website URL (Starting Point) *</Label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="seedUrl"
                                        name="seedUrl"
                                        placeholder="https://yourwebsite.com"
                                        value={chatbot.seedUrl}
                                        onChange={handleChange}
                                        disabled={saving}
                                        className={cn(
                                            "h-12 bg-background/50 border-border/50 rounded-xl pl-12 pr-4 font-bold focus-visible:ring-emerald-500",
                                            errors.seedUrl && "border-rose-500 focus-visible:ring-rose-500"
                                        )}
                                    />
                                </div>
                                {errors.seedUrl && <p className="text-xs font-bold text-rose-500 mt-1">{errors.seedUrl}</p>}
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-2">
                                    SiteIQ will crawl pages starting from this URL to build the knowledge base.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-border/50 mt-8">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => navigate('/siteiq/chatbots')}
                                disabled={saving}
                                className="h-12 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-muted/50"
                            >
                                <X size={14} className="mr-2" /> Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={saving}
                                className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all"
                            >
                                {saving ? (
                                    <><LoadingSpinner className="h-4 w-4 mr-2" /> Creating...</>
                                ) : (
                                    <><Save size={14} className="mr-2" /> Create Assistant</>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChatbotCreatePage;
