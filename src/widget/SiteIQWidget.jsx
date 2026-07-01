import React, { useState, useEffect, useRef } from 'react';
import createPublicApi from './publicApi';
import { MessageCircle, X, Send, Minus, Maximize2, Loader2, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './widget.css';

const SiteIQWidget = ({ chatbotId, apiKey }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [config, setConfig] = useState(null);
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [emailValue, setEmailValue] = useState('');
    const [emailCaptured, setEmailCaptured] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    
    const messagesEndRef = useRef(null);
    const apiRef = useRef(null);

    useEffect(() => {
        if (!chatbotId || !apiKey) return;
        apiRef.current = createPublicApi(chatbotId, apiKey);
        
        // Fetch config
        apiRef.current.getChatbotConfig()
            .then(data => {
                setConfig(data);
                if (data.appearance) {
                    // Apply theme variables
                    const root = document.documentElement;
                    if (data.appearance.primaryColor) root.style.setProperty('--siteiq-primary', data.appearance.primaryColor);
                    if (data.appearance.secondaryColor) root.style.setProperty('--siteiq-secondary', data.appearance.secondaryColor);
                    if (data.appearance.fontFamily) root.style.setProperty('--siteiq-font', data.appearance.fontFamily);
                }
            })
            .catch(err => {
                console.error("Failed to load widget config", err);
                setError("Failed to load chat configuration");
            });
    }, [chatbotId, apiKey]);

    useEffect(() => {
        if (isOpen && !session && config) {
            initSession();
        }
    }, [isOpen, session, config]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const initSession = async () => {
        try {
            const newSession = await apiRef.current.createSession();
            setSession(newSession);
            setMessages([
                { id: 'welcome', role: 'assistant', content: config?.appearance?.welcomeMessage || 'Hi! How can I help you today?' }
            ]);
        } catch (err) {
            console.error("Failed to create session", err);
            setError("Could not connect to chat service");
        }
    };

    const handleFeedback = async (messageId, feedbackValue) => {
        try {
            await apiRef.current.submitFeedback(messageId, feedbackValue);
            setMessages(prev => prev.map(m => 
                m.id === messageId ? { ...m, feedback: feedbackValue } : m
            ));
        } catch (err) {
            console.error("Failed to submit feedback", err);
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || !session || isTyping) return;

        const userMsg = inputValue.trim();
        setInputValue('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
        setIsTyping(true);

        const aiMsgId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }]);

        try {
            await apiRef.current.streamMessage(
                session.id,
                userMsg,
                emailCaptured ? emailValue : null,
                (chunk) => {
                    setMessages(prev => prev.map(m => 
                        m.id === aiMsgId ? { ...m, content: m.content + chunk } : m
                    ));
                },
                (err) => {
                    setMessages(prev => prev.map(m => 
                        m.id === aiMsgId ? { ...m, content: m.content + '\n\n*Error: Failed to fetch response.*' } : m
                    ));
                    setIsTyping(false);
                },
                () => {
                    setIsTyping(false);
                }
            );
        } catch (err) {
            setMessages(prev => prev.map(m => 
                m.id === aiMsgId ? { ...m, content: '*Error communicating with server.*' } : m
            ));
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!config) return null;

    const appearance = config.appearance || {};
    const positionClass = appearance.position === 'bottom-left' ? 'siteiq-bottom-left' : 'siteiq-bottom-right';

    if (!isOpen) {
        return (
            <button 
                className={`siteiq-fab ${positionClass}`}
                onClick={() => setIsOpen(true)}
                style={{ backgroundColor: 'var(--siteiq-primary)' }}
                aria-label="Open Chat"
            >
                <MessageCircle size={28} className="siteiq-fab-icon" />
            </button>
        );
    }

    return (
        <div className={`siteiq-widget-container ${positionClass} ${isMinimized ? 'siteiq-minimized' : ''}`}>
            <div className="siteiq-header" style={{ backgroundColor: 'var(--siteiq-primary)', color: 'var(--siteiq-secondary)' }}>
                <div className="siteiq-header-title">
                    {appearance.avatarUrl ? (
                        <img src={appearance.avatarUrl} alt="Avatar" className="siteiq-avatar" />
                    ) : (
                        <Bot size={20} />
                    )}
                    <span className="siteiq-bot-name">{appearance.botName || 'Assistant'}</span>
                </div>
                <div className="siteiq-header-actions">
                    <button onClick={() => setIsMinimized(!isMinimized)} className="siteiq-icon-btn" aria-label={isMinimized ? "Maximize" : "Minimize"}>
                        {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="siteiq-icon-btn" aria-label="Close Chat">
                        <X size={16} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    <div className="siteiq-messages-area">
                        {error && (
                            <div className="siteiq-error-banner">
                                {error}
                            </div>
                        )}
                        {messages.map((msg) => (
                            <div key={msg.id} className={`siteiq-message-wrapper ${msg.role === 'user' ? 'siteiq-user-wrapper' : 'siteiq-assistant-wrapper'}`}>
                                <div className={`siteiq-message ${msg.role === 'user' ? 'siteiq-user-message' : 'siteiq-assistant-message'}`}>
                                    {msg.role === 'assistant' ? (
                                        <>
                                            <ReactMarkdown className="siteiq-markdown">{msg.content}</ReactMarkdown>
                                            {msg.id !== 'welcome' && (
                                                <div className="siteiq-feedback-actions">
                                                    <button 
                                                        className={`siteiq-feedback-btn ${msg.feedback === 'up' ? 'active' : ''}`} 
                                                        onClick={() => handleFeedback(msg.id, 'up')}
                                                        aria-label="Helpful"
                                                    >
                                                        <ThumbsUp size={14} />
                                                    </button>
                                                    <button 
                                                        className={`siteiq-feedback-btn ${msg.feedback === 'down' ? 'active' : ''}`}
                                                        onClick={() => handleFeedback(msg.id, 'down')}
                                                        aria-label="Not helpful"
                                                    >
                                                        <ThumbsDown size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="siteiq-message-wrapper siteiq-assistant-wrapper">
                                <div className="siteiq-message siteiq-assistant-message siteiq-typing-indicator">
                                    <Loader2 size={16} className="siteiq-spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {config.collectEmail && !emailCaptured ? (
                        <div className="siteiq-email-capture">
                            <div className="siteiq-email-prompt">Please provide your email to start chat:</div>
                            <div className="siteiq-input-area" style={{ borderTop: 'none', padding: '10px 16px' }}>
                                <input
                                    type="email"
                                    className="siteiq-input siteiq-email-input"
                                    placeholder="your.email@example.com"
                                    value={emailValue}
                                    onChange={(e) => setEmailValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && emailValue) {
                                            setEmailCaptured(true);
                                        }
                                    }}
                                />
                                <button 
                                    className="siteiq-send-btn" 
                                    onClick={() => setEmailCaptured(true)}
                                    disabled={!emailValue.trim()}
                                    style={{ color: emailValue.trim() ? 'var(--siteiq-primary)' : 'inherit' }}
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="siteiq-input-area">
                            <textarea
                                className="siteiq-input"
                                placeholder="Type a message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={!session || isTyping}
                                rows={1}
                            />
                            <button 
                                className="siteiq-send-btn" 
                                onClick={handleSend}
                                disabled={!inputValue.trim() || !session || isTyping}
                                style={{ color: inputValue.trim() ? 'var(--siteiq-primary)' : 'inherit' }}
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SiteIQWidget;
