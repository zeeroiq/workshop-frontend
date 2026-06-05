import React, { useState, useEffect } from 'react';
import { workshopService } from '@/services/workshopService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { 
    AlertCircle, 
    CheckCircle2, 
    Upload, 
    Wrench, 
    Mail, 
    Phone, 
    MapPin, 
    FileText, 
    Zap,
    Image as ImageIcon, Search
} from "lucide-react";
import { getAuthenticatedUrl } from "@/utils/storage";
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';

const Settings = () => {
    const [settings, setSettings] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        invoicePrefix: 'INV', omnisearchEnabled: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await workshopService.getSettings();
            setSettings(data);
            if (data.logoUrl) {
                setLogoPreview(data.logoUrl);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to sync workshop profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleToggleChange = (name, checked) => {
        setSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);

        try {
            setSaving(true);
            const logoUrl = await workshopService.uploadLogo(file);
            window.dispatchEvent(new CustomEvent("workshop-settings-updated", { detail: { ...settings, logoUrl } }));
            setSettings(prev => ({ ...prev, logoUrl }));
            toast.success('Brand identity updated successfully.');
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast.error('Identity upload failed.');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const updatedData = await workshopService.updateSettings(settings);
            window.dispatchEvent(new CustomEvent("workshop-settings-updated", { detail: updatedData }));
            toast.success('Workshop profile synchronized.');
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update operational parameters.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col gap-2 pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500/80">Profile Configuration</span>
                </div>
                <h1 className="text-4xl font-black text-foreground tracking-tight">Workshop Settings</h1>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Configure your business identity and operational parameters.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Logo Section */}
                <div className="space-y-6">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
                        <CardHeader className="border-b border-border/50 bg-muted/20">
                            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <ImageIcon size={18} className="text-emerald-500" /> Brand Identity
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Workshop Logo Assets</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8 flex flex-col items-center">
                            <div className="relative group mb-6">
                                <div className="h-40 w-40 rounded-2xl border-2 border-dashed border-border/50 flex items-center justify-center overflow-hidden bg-muted/30 group-hover:border-emerald-500/50 transition-all duration-300 shadow-inner">
                                    {logoPreview ? (
                                        <img 
                                            src={logoPreview.startsWith('data:') ? logoPreview : getAuthenticatedUrl(logoPreview)} 
                                            alt="Identity" 
                                            className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" 
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Upload className="h-10 w-10 opacity-20" />
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Upload Logo</span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
                            </div>

                            <div className="w-full space-y-3">
                                <Label htmlFor="logo-upload" className="block w-full">
                                    <div className="flex items-center justify-center gap-2 w-full h-11 px-4 rounded-xl border border-border/50 bg-background hover:bg-muted transition-all cursor-pointer font-bold text-xs">
                                        <Upload size={16} className="text-emerald-500" />
                                        <span>Update Branding</span>
                                    </div>
                                    <input
                                        id="logo-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        disabled={saving}
                                    />
                                </Label>
                                <p className="text-[9px] text-center text-muted-foreground uppercase font-bold tracking-tighter">Recommended: Square PNG/SVG, Max 2MB</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm rounded-2xl overflow-hidden hidden lg:block">
                         <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Zap size={20} className="text-emerald-500" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest">Active System</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Changes to workshop identity will reflect immediately across all invoices and reports. Ensure information accuracy for compliance.
                            </p>
                         </CardContent>
                    </Card>
                </div>

                {/* Form Section */}
                <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="border-b border-border/50 bg-muted/20">
                        <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                            <Wrench size={18} className="text-emerald-500" /> Operational Parameters
                        </CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">General Workshop Information</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Workshop Corporate Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={settings.name || ''}
                                    onChange={handleInputChange}
                                    required
                                    className="h-12 bg-background/50 border-border/50 focus:border-emerald-500/50 font-bold"
                                    placeholder="Enter workshop name"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Phone size={12} className="text-emerald-500" /> Operational Phone
                                    </Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={settings.phone || ''}
                                        onChange={handleInputChange}
                                        className="h-12 bg-background/50 border-border/50 font-bold"
                                        placeholder="+91 00000 00000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Mail size={12} className="text-emerald-500" /> Business Email
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={settings.email || ''}
                                        onChange={handleInputChange}
                                        className="h-12 bg-background/50 border-border/50 font-bold"
                                        placeholder="office@yourworkshop.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <MapPin size={12} className="text-emerald-500" /> Physical Address
                                </Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    value={settings.address || ''}
                                    onChange={handleInputChange}
                                    className="bg-background/50 border-border/50 min-h-[100px] font-bold py-4"
                                    placeholder="Complete operational address"
                                />
                            </div>

                                                        <div className="pt-6 border-t border-border/50">
                                <div className="flex items-center gap-2 mb-6">
                                    <Search size={18} className="text-emerald-500" />
                                    <h4 className="text-sm font-black uppercase tracking-tight">Search & Discovery</h4>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/30">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-bold uppercase tracking-tight">Enable Global Omnisearch</Label>
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Activate CMD+K shortcut and global search bar across the platform</p>
                                    </div>
                                    <Checkbox
                                        checked={settings.omnisearchEnabled}
                                        onCheckedChange={(checked) => handleToggleChange('omnisearchEnabled', checked)}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-border/50">
                                <div className="flex items-center gap-2 mb-6">
                                    <FileText size={18} className="text-emerald-500" />
                                    <h4 className="text-sm font-black uppercase tracking-tight">Invoice Digitization</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <div className="space-y-2">
                                        <Label htmlFor="invoicePrefix" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Serial Prefix</Label>
                                        <Input
                                            id="invoicePrefix"
                                            name="invoicePrefix"
                                            value={settings.invoicePrefix || 'INV'}
                                            onChange={handleInputChange}
                                            maxLength={10}
                                            className="h-12 bg-background/50 border-border/50 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                                        />
                                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">Preview: <span className="text-foreground">{settings.invoicePrefix || 'INV'}-2026-0001</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                <Button 
                                    type="submit" 
                                    className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 font-black uppercase tracking-widest" 
                                    disabled={saving}
                                >
                                    {saving ? 'Synchronizing...' : 'Save Configuration'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
