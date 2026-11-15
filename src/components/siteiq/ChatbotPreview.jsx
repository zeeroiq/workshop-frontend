import React from 'react';
import { Bot, Send, X, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ChatbotPreview = ({ appearance }) => {
    const {
        botName = 'Assistant',
        welcomeMessage = 'Hi! How can I help you?',
        primaryColor = '#4F46E5',
        secondaryColor = '#FFFFFF',
        fontFamily = 'Inter, sans-serif',
        position = 'bottom-right',
        avatarUrl = null
    } = appearance || {};

    const isBottomLeft = position === 'bottom-left';
    
    // Safely parse primary color to check if we need dark or light text
    // A simple approximation for preview purposes
    const isLightPrimary = primaryColor.toLowerCase() === '#ffffff' || primaryColor.toLowerCase() === '#fff';
    const headerTextColor = isLightPrimary ? '#000000' : secondaryColor;

    return (
        <div 
            className="relative w-full max-w-[400px] h-[600px] rounded-2xl overflow-hidden border border-border/50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 dark:bg-slate-900 mx-auto shadow-inner"
            style={{ fontFamily }}
        >
            {/* Widget Button */}
            <div 
                className={cn(
                    "absolute bottom-6 h-14 w-14 rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-transform hover:scale-105 z-10",
                    isBottomLeft ? "left-6" : "right-6"
                )}
                style={{ backgroundColor: primaryColor, color: headerTextColor }}
            >
                <Bot size={28} />
            </div>

            {/* Chat Window */}
            <div 
                className={cn(
                    "absolute bottom-24 w-[340px] h-[480px] bg-background border border-border/50 shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300",
                    isBottomLeft ? "left-6" : "right-6"
                )}
            >
                {/* Header */}
                <div 
                    className="h-16 px-4 flex items-center justify-between shrink-0"
                    style={{ backgroundColor: primaryColor, color: headerTextColor }}
                >
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-white/20 shadow-sm">
                            <AvatarImage src={avatarUrl || ''} alt={botName} />
                            <AvatarFallback style={{ backgroundColor: secondaryColor, color: primaryColor }}>
                                <Bot size={16} />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="font-bold text-sm tracking-tight">{botName}</h4>
                            <div className="flex items-center gap-1.5 opacity-80">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                                <span className="text-[10px] font-medium uppercase tracking-widest">Online</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-70 hover:opacity-100 rounded-full hover:bg-black/10" style={{ color: headerTextColor }}>
                        <X size={18} />
                    </Button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 p-4 overflow-y-auto bg-muted/10 space-y-4">
                    {/* Bot Message */}
                    <div className="flex items-start gap-2 max-w-[85%]">
                        <Avatar className="h-6 w-6 mt-1 border border-border/50 shadow-sm shrink-0">
                            <AvatarImage src={avatarUrl || ''} alt={botName} />
                            <AvatarFallback className="bg-muted text-muted-foreground">
                                <Bot size={12} />
                            </AvatarFallback>
                        </Avatar>
                        <div className="bg-card border border-border/50 shadow-sm p-3 rounded-2xl rounded-tl-sm text-sm text-card-foreground leading-relaxed">
                            {welcomeMessage}
                        </div>
                    </div>
                    
                    {/* User Message Mock */}
                    <div className="flex items-start gap-2 max-w-[85%] ml-auto flex-row-reverse">
                        <div 
                            className="p-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm"
                            style={{ backgroundColor: primaryColor, color: headerTextColor }}
                        >
                            How do I get started with your service?
                        </div>
                    </div>
                    
                    {/* Typing Indicator */}
                    <div className="flex items-start gap-2 max-w-[85%]">
                        <Avatar className="h-6 w-6 mt-1 border border-border/50 shadow-sm shrink-0">
                            <AvatarImage src={avatarUrl || ''} alt={botName} />
                            <AvatarFallback className="bg-muted text-muted-foreground">
                                <Bot size={12} />
                            </AvatarFallback>
                        </Avatar>
                        <div className="bg-card border border-border/50 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                            <span className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                            <span className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                            <span className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-border/50 bg-card">
                    <div className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-full px-4 py-2 focus-within:ring-1 focus-within:ring-ring transition-shadow">
                        <input 
                            type="text" 
                            placeholder="Type your message..." 
                            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                            disabled
                        />
                        <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1" disabled>
                            <Paperclip size={16} />
                        </button>
                        <button 
                            className="h-8 w-8 rounded-full flex items-center justify-center shadow-sm transition-transform hover:scale-105 shrink-0"
                            style={{ backgroundColor: primaryColor, color: headerTextColor }}
                            disabled
                        >
                            <Send size={14} className="ml-0.5" />
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest font-bold">Powered by SiteIQ</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatbotPreview;
