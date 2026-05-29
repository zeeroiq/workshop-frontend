import React, { useState, useEffect } from 'react';
import { workshopService } from '@/services/workshopService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react';

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
        <div className="container mx-auto py-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Workshop Settings</h1>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {message.type === 'success' ? <CheckCircle2 className="mr-2 h-5 w-5" /> : <AlertCircle className="mr-2 h-5 w-5" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Workshop Logo</CardTitle>
                        <CardDescription>Upload your brand identity</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <div className="w-full aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center mb-4 overflow-hidden bg-gray-50">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                            ) : (
                                <Upload className="h-12 w-12 text-gray-300" />
                            )}
                        </div>
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                            <Button variant="outline" asChild>
                                <span>Change Logo</span>
                            </Button>
                            <input
                                id="logo-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                disabled={saving}
                            />
                        </Label>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                        <CardDescription>Manage your workshop's public details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Workshop Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={settings.name || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={settings.phone || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={settings.email || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    value={settings.address || ''}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <CardTitle className="text-lg">Invoice Settings</CardTitle>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    <div className="space-y-2">
                                        <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                                        <Input
                                            id="invoicePrefix"
                                            name="invoicePrefix"
                                            value={settings.invoicePrefix || 'INV'}
                                            onChange={handleInputChange}
                                            maxLength={10}
                                        />
                                        <p className="text-xs text-gray-500">Example: {settings.invoicePrefix || 'INV'}-2026-0001</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
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
