import React, { useState, useEffect } from 'react';
import { 
    CheckCircle2, 
    Rocket, 
    Wrench, 
    Image as ImageIcon, 
    MapPin, 
    UserPlus, 
    ArrowRight, 
    ArrowLeft,
    ChevronRight,
    Loader2,
    FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { workshopService } from '@/services/workshopService';
import { userService } from '@/services/userService';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { getAuthenticatedUrl } from "@/utils/storage";

const SetupWizard = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        invoicePrefix: 'INV',
        mechanicName: '',
        mechanicEmail: '',
        mechanicPassword: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const settings = await workshopService.getSettings();
            setFormData(prev => ({
                ...prev,
                name: settings.name || '',
                address: settings.address || '',
                phone: settings.phone || '',
                email: settings.email || '',
                invoicePrefix: settings.invoicePrefix || 'INV'
            }));
            if (settings.logoUrl) {
                setLogoPreview(settings.logoUrl);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setLogoPreview(reader.result);
        reader.readAsDataURL(file);

        try {
            setLoading(true);
            const logoUrl = await workshopService.uploadLogo(file);
            setFormData(prev => ({ ...prev, logoUrl }));
            toast.success('Logo uploaded');
        } catch (error) {
            toast.error('Logo upload failed');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            // Update workshop settings
            await workshopService.updateSettings({
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                invoicePrefix: formData.invoicePrefix
            });

            // If mechanic info provided, create mechanic
            if (formData.mechanicEmail && formData.mechanicPassword) {
                const [firstName, ...lastNameParts] = formData.mechanicName.split(' ');
                await userService.createUser({
                    firstName: firstName,
                    lastName: lastNameParts.join(' ') || 'Technician',
                    email: formData.mechanicEmail,
                    password: formData.mechanicPassword,
                    roles: ['ROLE_MECHANIC']
                });
            }

            toast.success('Workshop setup complete! Welcome aboard.');
            onComplete?.();
        } catch (error) {
            console.error('Setup failed:', error);
            toast.error('Failed to complete setup. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl animate-in zoom-in-95 duration-300">
                <div className="mb-8 text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Mission Initialization</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">Welcome to YourWorkshop</h1>
                    <p className="text-muted-foreground font-medium">Let's get your digital workspace configured for peak performance.</p>
                </div>

                {/* Progress Bar */}
                <div className="flex items-center justify-between mb-8 px-2">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black transition-all",
                                step === s ? "bg-emerald-500 text-emerald-950 shadow-lg shadow-emerald-500/20" : 
                                step > s ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
                            )}>
                                {step > s ? <CheckCircle2 size={16} /> : s}
                            </div>
                            <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest hidden sm:inline",
                                step === s ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {s === 1 ? 'Identity' : s === 2 ? 'Operations' : 'Team'}
                            </span>
                            {s < 3 && <ChevronRight size={14} className="text-muted-foreground/30 mx-2" />}
                        </div>
                    ))}
                </div>

                <Card className="border-border/50 bg-card/50 shadow-2xl overflow-hidden rounded-[2rem]">
                    <CardContent className="p-8 sm:p-12">
                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative group">
                                        <div className="h-32 w-32 rounded-3xl border-2 border-dashed border-border/50 flex items-center justify-center overflow-hidden bg-muted/30 group-hover:border-emerald-500/50 transition-all cursor-pointer">
                                            {logoPreview ? (
                                                <img src={logoPreview.startsWith('data:') ? logoPreview : getAuthenticatedUrl(logoPreview)} alt="Logo" className="h-full w-full object-contain p-4" />
                                            ) : (
                                                <ImageIcon className="h-10 w-10 text-muted-foreground opacity-20" />
                                            )}
                                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center shadow-lg pointer-events-none">
                                            <Rocket size={14} className="text-white" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Workshop Branding Asset</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Workshop Name</Label>
                                        <Input 
                                            name="name" 
                                            value={formData.name} 
                                            onChange={handleInputChange} 
                                            className="h-12 bg-background/50 font-bold" 
                                            placeholder="e.g. Apex Performance Center"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <FileText size={12} className="text-emerald-500" /> Invoice Serial Prefix
                                        </Label>
                                        <Input 
                                            name="invoicePrefix" 
                                            value={formData.invoicePrefix} 
                                            onChange={handleInputChange} 
                                            className="h-12 bg-background/50 font-mono font-bold" 
                                            maxLength={5}
                                        />
                                        <p className="text-[10px] text-muted-foreground font-bold">Serial Example: {formData.invoicePrefix}-2026-0001</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <MapPin size={12} className="text-emerald-500" /> Physical Address
                                    </Label>
                                    <Textarea 
                                        name="address" 
                                        value={formData.address} 
                                        onChange={handleInputChange} 
                                        className="bg-background/50 font-bold min-h-[100px] py-4" 
                                        placeholder="Complete operational address for invoices"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Contact Phone</Label>
                                        <Input 
                                            name="phone" 
                                            value={formData.phone} 
                                            onChange={handleInputChange} 
                                            className="h-12 bg-background/50 font-bold" 
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Support Email</Label>
                                        <Input 
                                            name="email" 
                                            value={formData.email} 
                                            onChange={handleInputChange} 
                                            className="h-12 bg-background/50 font-bold" 
                                            placeholder="contact@yourworkshop.com"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex items-start gap-4">
                                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                                        <UserPlus size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-tight text-emerald-500">Initialize Your Team</h4>
                                        <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                                            Add your first technician to start assigning jobs and tracking performance metrics.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                                        <Input 
                                            name="mechanicName" 
                                            value={formData.mechanicName} 
                                            onChange={handleInputChange} 
                                            className="h-12 bg-background/50 font-bold" 
                                            placeholder="e.g. Mike Tyson"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Login Email</Label>
                                        <Input 
                                            name="mechanicEmail" 
                                            value={formData.mechanicEmail} 
                                            onChange={handleInputChange} 
                                            className="h-12 bg-background/50 font-bold" 
                                            placeholder="mike@yourworkshop.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Default Password</Label>
                                        <Input 
                                            name="mechanicPassword" 
                                            type="password" 
                                            value={formData.mechanicPassword} 
                                            onChange={handleInputChange} 
                                            className="h-12 bg-background/50 font-bold" 
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-4 mt-12 pt-8 border-t border-border/50">
                            <Button 
                                variant="ghost" 
                                onClick={prevStep} 
                                disabled={step === 1 || loading}
                                className={cn("px-6 h-12 font-bold uppercase text-[10px] tracking-widest", step === 1 && "opacity-0")}
                            >
                                <ArrowLeft size={16} className="mr-2" /> Back
                            </Button>

                            {step < 3 ? (
                                <Button 
                                    onClick={nextStep} 
                                    className="px-10 h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 font-black uppercase tracking-widest rounded-xl"
                                >
                                    Continue <ArrowRight size={16} className="ml-2" />
                                </Button>
                            ) : (
                                <Button 
                                    onClick={handleFinalSubmit} 
                                    disabled={loading}
                                    className="px-10 h-12 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 font-black uppercase tracking-widest rounded-xl"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    ) : (
                                        <CheckCircle2 size={16} className="mr-2" />
                                    )}
                                    Complete Setup
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <p className="mt-8 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">
                    Configuration stored securely &middot; Change anytime in settings
                </p>
            </div>
        </div>
    );
};

export default SetupWizard;
