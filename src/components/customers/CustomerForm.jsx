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
import { FaSave, FaTimes, FaUser, FaPhone, FaEnvelope, FaMapPin } from 'react-icons/fa';

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
            toast.error('Failed to fetch customer details');
            console.error('Error fetching customer:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomer(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (isEdit) {
                await customerService.update(id, customer);
                toast.success('Customer updated successfully');
            } else {
                await customerService.create(customer);
                toast.success('Customer created successfully');
            }
            navigate('/customers');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to save customer';
            toast.error(message);
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{isEdit ? 'Update Customer Profile' : 'Register New Customer'}</h1>
                <p className="text-muted-foreground font-medium text-sm md:text-base">Ensure client contact details are accurate for service notifications.</p>
            </div>

            <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/50">
                <CardHeader className="border-b border-border/50 bg-muted/20">
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <FaUser className="text-primary text-xs" /> Personal Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest opacity-70">First Name *</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={customer.firstName}
                                    onChange={handleChange}
                                    required
                                    className="h-11 bg-background/50 font-bold"
                                    placeholder="Enter first name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest opacity-70">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={customer.lastName}
                                    onChange={handleChange}
                                    required
                                    className="h-11 bg-background/50 font-bold"
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest opacity-70">Phone Number *</Label>
                                <div className="relative">
                                    <FaPhone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground opacity-50" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={customer.phone}
                                        onChange={handleChange}
                                        required
                                        className="h-11 pl-10 bg-background/50 font-bold"
                                        placeholder="+91 000 000 0000"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest opacity-70">Email Address</Label>
                                <div className="relative">
                                    <FaEnvelope className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground opacity-50" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={customer.email}
                                        onChange={handleChange}
                                        className="h-11 pl-10 bg-background/50 font-medium"
                                        placeholder="client@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest opacity-70">Residential Address</Label>
                            <div className="relative">
                                <FaMapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground opacity-50" />
                                <Textarea
                                    id="address"
                                    name="address"
                                    value={customer.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="pl-10 bg-background/50 font-medium pt-3"
                                    placeholder="Enter physical address for records"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border/50">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/customers')}
                                className="h-11 font-bold uppercase tracking-widest text-xs order-2 sm:order-1"
                            >
                                <FaTimes className="mr-2 h-3 w-3" /> Abort
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="h-11 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 min-w-[140px] order-1 sm:order-2"
                            >
                                <FaSave className="mr-2 h-3 w-3" />
                                {saving ? 'Synchronizing...' : (isEdit ? 'Apply Changes' : 'Initialize Profile')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CustomerForm;
