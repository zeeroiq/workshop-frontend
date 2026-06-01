import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '@/services/customerService';
import LoadingSpinner from '../common/LoadingSpinner';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, X, User, Phone, Mail, MapPin, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const CustomerForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [customer, setCustomer] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        if (isEdit) {
            fetchCustomer();
        }
    }, [id]);

    const fetchCustomer = async () => {
        try {
            setLoading(true);
            const response = await customerService.getById(id);
            setCustomer(response.data);
        } catch (error) {
            toast.error('Failed to sync customer profile.');
            console.error('Error fetching customer:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomer(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (isEdit) {
                await customerService.update(id, customer);
                toast.success('Customer profile synchronized.');
            } else {
                await customerService.create(customer);
                toast.success('Customer successfully onboarded.');
            }
            navigate('/customers');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to archive customer data';
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-[calc(100vh-10rem)]"><LoadingSpinner /></div>;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex flex-col gap-2 pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500/80">Operational Registry</span>
                </div>
                <h1 className="text-4xl font-black text-foreground tracking-tight">{isEdit ? 'Modify Profile' : 'Onboard Customer'}</h1>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Ensure information accuracy for seamless communication and billing.</p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="border-b border-border/50 bg-muted/20 p-8">
                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                        <User size={18} className="text-emerald-500" /> Essential Information
                    </CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verification parameters for profile archival</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Primary Name *</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={customer.firstName}
                                    onChange={handleChange}
                                    required
                                    className="h-12 bg-background/50 border-border/50 focus:border-emerald-500/50 font-bold"
                                    placeholder="Enter first name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Family Name *</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={customer.lastName}
                                    onChange={handleChange}
                                    required
                                    className="h-12 bg-background/50 border-border/50 focus:border-emerald-500/50 font-bold"
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Phone size={12} className="text-emerald-500" /> Operational Phone *
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={customer.phone}
                                    onChange={handleChange}
                                    required
                                    className="h-12 bg-background/50 border-border/50 focus:border-emerald-500/50 font-bold"
                                    placeholder="+91 00000 00000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Mail size={12} className="text-emerald-500" /> Primary Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={customer.email}
                                    onChange={handleChange}
                                    className="h-12 bg-background/50 border-border/50 focus:border-emerald-500/50 font-bold"
                                    placeholder="customer@domain.com"
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
                                value={customer.address}
                                onChange={handleChange}
                                className="bg-background/50 border-border/50 min-h-[100px] font-bold py-4 focus:border-emerald-500/50"
                                placeholder="Archived address for logistics and billing..."
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t border-border/50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/customers')}
                                className="h-12 px-8 border-border/50 rounded-xl font-bold uppercase text-[10px] tracking-widest"
                            >
                                <X className="mr-2 h-4 w-4 text-rose-500" /> Abort
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="h-12 px-10 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 font-black uppercase tracking-widest rounded-xl"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? 'Synchronizing...' : 'Commit Record'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CustomerForm;
