import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings2, Loader2 } from 'lucide-react';

const BehaviorTab = ({ chatbot, onUpdate }) => {
    const [formData, setFormData] = useState({
        systemPromptSuffix: '',
        maxTokens: 512,
        temperature: 0.3,
        topK: 5,
        fallbackMessage: "I don't have information on that topic.",
        collectEmail: false
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (chatbot?.behavior) {
            setFormData({
                systemPromptSuffix: chatbot.behavior.systemPromptSuffix || '',
                maxTokens: chatbot.behavior.maxTokens || 512,
                temperature: chatbot.behavior.temperature ?? 0.3,
                topK: chatbot.behavior.topK || 5,
                fallbackMessage: chatbot.behavior.fallbackMessage || "I don't have information on that topic.",
                collectEmail: chatbot.behavior.collectEmail || false
            });
        }
    }, [chatbot]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate({ behavior: formData });
        } catch (error) {
            console.error('Failed to update behavior', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl max-w-3xl">
            <CardHeader className="border-b border-border/50 bg-muted/20 p-6">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <Settings2 size={18} className="text-emerald-500" /> Configure Behavior
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                    Control how the AI responds to users
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
                <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-widest flex justify-between">
                        <span>System Prompt Instructions</span>
                        <span className="text-muted-foreground font-normal lowercase tracking-normal">{formData.systemPromptSuffix.length}/2000</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        This text is appended to the AI's system instructions. Use it to add rules, tone guidelines, or company facts.
                    </p>
                    <Textarea 
                        value={formData.systemPromptSuffix} 
                        onChange={(e) => handleChange('systemPromptSuffix', e.target.value)} 
                        maxLength={2000}
                        className="resize-none h-32 bg-background mt-1"
                        placeholder="e.g. Always respond in a friendly and professional tone. Never mention competitors."
                    />
                </div>

                <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-widest flex justify-between">
                        <span>Fallback Message</span>
                        <span className="text-muted-foreground font-normal lowercase tracking-normal">{formData.fallbackMessage.length}/500</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Shown when the AI cannot find a relevant answer in your indexed pages.
                    </p>
                    <Textarea 
                        value={formData.fallbackMessage} 
                        onChange={(e) => handleChange('fallbackMessage', e.target.value)} 
                        maxLength={500}
                        className="resize-none h-20 bg-background mt-1"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-border/50">
                    <div className="grid gap-4">
                        <div>
                            <Label className="text-xs font-bold uppercase tracking-widest flex justify-between">
                                <span>Max Response Length</span>
                                <span className="text-emerald-500">{formData.maxTokens} tokens</span>
                            </Label>
                            <p className="text-[10px] text-muted-foreground mt-1 mb-3">
                                Controls how long the AI's responses can be. (128-2048)
                            </p>
                            <input 
                                type="range" 
                                min="128" max="2048" step="16"
                                value={formData.maxTokens} 
                                onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))} 
                                className="w-full accent-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div>
                            <Label className="text-xs font-bold uppercase tracking-widest flex justify-between">
                                <span>Creativity (Temperature)</span>
                                <span className="text-emerald-500">{formData.temperature.toFixed(2)}</span>
                            </Label>
                            <p className="text-[10px] text-muted-foreground mt-1 mb-3 flex justify-between">
                                <span>Precise</span>
                                <span>Creative</span>
                            </p>
                            <input 
                                type="range" 
                                min="0.0" max="1.0" step="0.05"
                                value={formData.temperature} 
                                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))} 
                                className="w-full accent-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                    <div className="flex items-start space-x-3 bg-muted/20 p-4 rounded-xl border border-border/50">
                        <Checkbox 
                            id="collectEmail" 
                            checked={formData.collectEmail} 
                            onCheckedChange={(checked) => handleChange('collectEmail', checked)} 
                            className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label 
                                htmlFor="collectEmail" 
                                className="text-sm font-bold cursor-pointer"
                            >
                                Collect Visitor Email
                            </Label>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                If enabled, the widget will ask for an email address before the visitor can send their first message. Useful for lead generation.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border/50 flex justify-end">
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="font-bold uppercase tracking-widest text-[10px] h-10 px-8 rounded-xl"
                    >
                        {isSaving ? <><Loader2 size={16} className="mr-2 animate-spin" /> Saving...</> : 'Save Behavior'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default BehaviorTab;
