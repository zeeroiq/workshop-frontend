import React, {useEffect, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {Loader2, Palette} from 'lucide-react';
import ChatbotPreview from './ChatbotPreview';

const AppearanceTab = ({ chatbot, onUpdate }) => {
    const [formData, setFormData] = useState({
        botName: 'Assistant',
        welcomeMessage: 'Hi! How can I help you?',
        primaryColor: '#4F46E5',
        secondaryColor: '#FFFFFF',
        fontFamily: 'Inter, sans-serif',
        position: 'bottom-right',
        avatarUrl: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (chatbot?.appearance) {
            setFormData({
                botName: chatbot.appearance.botName || 'Assistant',
                welcomeMessage: chatbot.appearance.welcomeMessage || 'Hi! How can I help you?',
                primaryColor: chatbot.appearance.primaryColor || '#4F46E5',
                secondaryColor: chatbot.appearance.secondaryColor || '#FFFFFF',
                fontFamily: chatbot.appearance.fontFamily || 'Inter, sans-serif',
                position: chatbot.appearance.position || 'bottom-right',
                avatarUrl: chatbot.appearance.avatarUrl || ''
            });
        }
    }, [chatbot]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate({ appearance: formData });
            // toast is handled in the hook
        } catch (error) {
            console.error('Failed to update appearance', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl h-fit">
                <CardHeader className="border-b border-border/50 bg-muted/20 p-6">
                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <Palette size={18} className="text-emerald-500" /> Customise Appearance
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                        Configure how the widget looks on your site
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-widest">Bot Name</Label>
                            <Input 
                                value={formData.botName} 
                                onChange={(e) => handleChange('botName', e.target.value)} 
                                maxLength={50}
                                className="bg-background"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-widest flex justify-between">
                                <span>Welcome Message</span>
                                <span className="text-muted-foreground font-normal lowercase tracking-normal">{formData.welcomeMessage.length}/500</span>
                            </Label>
                            <Textarea 
                                value={formData.welcomeMessage} 
                                onChange={(e) => handleChange('welcomeMessage', e.target.value)} 
                                maxLength={500}
                                className="resize-none h-24 bg-background"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold uppercase tracking-widest">Primary Color</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        type="color" 
                                        value={formData.primaryColor} 
                                        onChange={(e) => handleChange('primaryColor', e.target.value)} 
                                        className="w-12 p-1 h-10 cursor-pointer bg-background"
                                    />
                                    <Input 
                                        type="text" 
                                        value={formData.primaryColor} 
                                        onChange={(e) => handleChange('primaryColor', e.target.value)} 
                                        className="flex-1 font-mono uppercase bg-background"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold uppercase tracking-widest">Secondary Color</Label>
                                <div className="flex gap-2">
                                    <Input 
                                        type="color" 
                                        value={formData.secondaryColor} 
                                        onChange={(e) => handleChange('secondaryColor', e.target.value)} 
                                        className="w-12 p-1 h-10 cursor-pointer bg-background"
                                    />
                                    <Input 
                                        type="text" 
                                        value={formData.secondaryColor} 
                                        onChange={(e) => handleChange('secondaryColor', e.target.value)} 
                                        className="flex-1 font-mono uppercase bg-background"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-widest">Font Family</Label>
                            <Select value={formData.fontFamily} onValueChange={(val) => handleChange('fontFamily', val)}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Select a font" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                                    <SelectItem value="system-ui, sans-serif">System Default</SelectItem>
                                    <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                                    <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-xs font-bold uppercase tracking-widest">Widget Position</Label>
                            <RadioGroup 
                                value={formData.position} 
                                onValueChange={(val) => handleChange('position', val)}
                                className="flex gap-6 pt-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="bottom-left" id="r1" />
                                    <Label htmlFor="r1" className="cursor-pointer text-sm font-medium">Bottom Left</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="bottom-right" id="r2" />
                                    <Label htmlFor="r2" className="cursor-pointer text-sm font-medium">Bottom Right</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="grid gap-2 pt-2">
                            <Label className="text-xs font-bold uppercase tracking-widest">Avatar URL (Optional)</Label>
                            <Input 
                                value={formData.avatarUrl} 
                                onChange={(e) => handleChange('avatarUrl', e.target.value)} 
                                placeholder="https://example.com/avatar.png"
                                className="bg-background"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border/50">
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="w-full font-bold uppercase tracking-widest text-[10px] h-12 rounded-xl"
                        >
                            {isSaving ? <><Loader2 size={16} className="mr-2 animate-spin" /> Saving...</> : 'Save Appearance'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-xl">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                        Live Preview
                    </h4>
                    <p className="text-xs mt-1 opacity-90 leading-relaxed">
                        Changes here will reflect on your embedded widget instantly after saving. No code changes required on your website.
                    </p>
                </div>
                <ChatbotPreview appearance={formData} />
            </div>
        </div>
    );
};

export default AppearanceTab;
