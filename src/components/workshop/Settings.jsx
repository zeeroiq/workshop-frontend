import React, { useState, useEffect } from 'react';
import { workshopService } from '@/services/workshopService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AlertCircle, CheckCircle2, Upload, Settings as SettingsIcon, Store, Mail, Phone, MapPin, Receipt, Camera } from "lucide-react";
import { getAuthenticatedUrl } from "@/utils/storage";
import { cn } from "@/lib/utils";

const Settings = () => {
    const [settings, setSettings] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        invoicePrefix: 'INV'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
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
            setMessage({ type: 'error', text: 'Failed to load settings.' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);

        try {
            setSaving(true);
            const logoUrl = await workshopService.uploadLogo(file);
            window.dispatchEvent(new CustomEvent("workshop-settings-updated", { detail: { ...settings, logoUrl } }));
            setSettings(prev => ({ ...prev, logoUrl }));
            setMessage({ type: 'success', text: 'Logo uploaded successfully.' });
        } catch (error) {
            console.error('Error uploading logo:', error);
            setMessage({ type: 'error', text: 'Failed to upload logo.' });
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const updatedData = await workshopService.updateSettings(settings);
            window.dispatchEvent(new CustomEvent("workshop-settings-updated", { detail: updatedData }));
            setMessage({ type: 'success', text: 'Settings updated successfully.' });
        } catch (error) {
            console.error('Error updating settings:', error);
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="container mx-auto py-4 md:py-8 max-w-5xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <SettingsIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">Workshop Configuration</h1>
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Global System Preferences</p>
                    </div>
                </div>
            </div>

            {message && (
                <div className={cn(
                    "p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-lg border",
                    message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'
                )}>
                    {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span className="font-bold text-sm tracking-tight">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Brand Identity */}
                <Card className="lg:col-span-1 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden h-fit">
                    <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Camera className="h-3.5 w-3.5 opacity-50" /> Brand Identity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center">
                        <div className="relative group w-full aspect-square max-w-[200px] mx-auto border-2 border-dashed border-border rounded-2xl flex items-center justify-center mb-6 overflow-hidden bg-background/50 hover:border-primary/50 transition-all duration-300">
                            {logoPreview ? (
                                <img src={getAuthenticatedUrl(logoPreview)} alt="Logo Preview" className="max-w-[80%] max-h-[80%] object-contain drop-shadow-2xl" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 opacity-20">
                                    <Upload className="h-10 w-10" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">No Logo</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <Label htmlFor="logo-upload" className="cursor-pointer">
                                    <span className="text-white text-xs font-black uppercase tracking-widest">Update Branding</span>
                                </Label>
                            </div>
                        </div>
                        <input
                            id="logo-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={saving}
                        />
                        <div className="text-center">
                            <h4 className="font-bold text-foreground">Workshop Logo</h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">PNG, JPG or SVG (Max 2MB)</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Core Settings Form */}
                <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                        <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                            <Store className="h-3.5 w-3.5 opacity-50" /> Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest opacity-70">Commercial Name</Label>
                                    <div className="relative">
                                        <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            name="name"
                                            value={settings.name || ''}
                                            onChange={handleInputChange}
                                            className="pl-10 h-11 font-bold bg-background/50"
                                            placeholder="Enter workshop name"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest opacity-70">Support Hotline</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            name="phone"
                                            value={settings.phone || ''}
                                            onChange={handleInputChange}
                                            className="pl-10 h-11 font-medium bg-background/50"
                                            placeholder="+91 000 000 0000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest opacity-70">Business Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={settings.email || ''}
                                            onChange={handleInputChange}
                                            className="pl-10 h-11 font-medium bg-background/50"
                                            placeholder="info@workshop.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest opacity-70">Facility Address</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="address"
                                            name="address"
                                            value={settings.address || ''}
                                            onChange={handleInputChange}
                                            className="pl-10 h-11 font-medium bg-background/50"
                                            placeholder="Building, Street, City, State, ZIP"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-border/50">
                                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Receipt className="h-3.5 w-3.5 opacity-50" /> Billing System
                                </CardTitle>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="invoicePrefix" className="text-[10px] font-black uppercase tracking-widest opacity-70">Invoice Serial Prefix</Label>
                                        <Input
                                            id="invoicePrefix"
                                            name="invoicePrefix"
                                            value={settings.invoicePrefix || 'INV'}
                                            onChange={handleInputChange}
                                            className="h-11 font-black tracking-widest uppercase bg-background/50"
                                            maxLength={10}
                                        />
                                        <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter italic">
                                            Sequence Example: <span className="text-primary">{settings.invoicePrefix || 'INV'}-2026-0001</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button type="submit" className="w-full h-12 font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" disabled={saving}>
                                    {saving ? 'Synchronizing Datasets...' : 'Deploy System Changes'}
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
