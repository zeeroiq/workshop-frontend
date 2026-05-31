import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { workshopMgmtService } from '@/services/workshopMgmtService';
import { UserPlus, Save, X, ShieldCheck, Mail, Phone, MapPin, Key } from 'lucide-react';
import { cn } from "@/lib/utils";

const UserForm = ({ user, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        roles: [],
        password: '',
    });
    const [availableRoles, setAvailableRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                roles: (Array.isArray(user.roles) ? user.roles : [user.roles]).map(r => r.replace('ROLE_', '')),
                password: '',
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await workshopMgmtService.listRoles();
                setAvailableRoles(data || []);
            } catch (err) {
                console.error("Error fetching roles:", err);
            }
        };
        fetchRoles();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleRoleChange = (roleName) => {
        setFormData(prev => {
            const newRoles = prev.roles.includes(roleName)
                ? prev.roles.filter(r => r !== roleName)
                : [...prev.roles, roleName];
            return { ...prev, roles: newRoles };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (user) {
                setError({ message: 'User update not supported via this form yet.' });
            } else {
                await workshopMgmtService.createUser(null, formData);
                onSave();
            }
        } catch (err) {
            console.error('Error saving user:', err);
            setError(err.response?.data || { message: 'Failed to synchronize staff data.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-border/50 shadow-lg backdrop-blur-sm bg-card/50 overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/50 p-6">
                <div className="flex items-center gap-3 text-primary mb-1">
                    <UserPlus className="h-5 w-5" />
                    <CardTitle className="text-xl font-black uppercase tracking-tight">{user ? 'Edit Staff Credentials' : 'Initialize Staff Profile'}</CardTitle>
                </div>
                <CardDescription className="font-medium">
                    Provision system access and define operational permissions for workshop personnel.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest opacity-70">First Name *</Label>
                            <Input id="firstName" value={formData.firstName} onChange={handleChange} required className="h-11 bg-background/50 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest opacity-70">Last Name</Label>
                            <Input id="lastName" value={formData.lastName} onChange={handleChange} className="h-11 bg-background/50 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest opacity-70">Communication Node (Email) *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground opacity-50" />
                                <Input id="email" type="email" value={formData.email} onChange={handleChange} required className="h-11 pl-10 bg-background/50 font-medium" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest opacity-70">Hotline Number *</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground opacity-50" />
                                <Input id="phone" value={formData.phone} onChange={handleChange} required className="h-11 pl-10 bg-background/50 font-bold" />
                            </div>
                        </div>
                        {!user && (
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest opacity-70">Access Key (Password) *</Label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground opacity-50" />
                                    <Input id="password" type="password" value={formData.password} onChange={handleChange} required className="h-11 pl-10 bg-background/50 font-bold" />
                                </div>
                            </div>
                        )}
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest opacity-70">Base Location (Address)</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground opacity-50" />
                                <Textarea id="address" value={formData.address} onChange={handleChange} rows={2} required className="pl-10 bg-background/50 font-medium pt-3" />
                            </div>
                        </div>
                        
                        <div className="md:col-span-2 space-y-4 pt-4 border-t border-border/30">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                <Label className="text-sm font-black uppercase tracking-widest">Operational Role Matrix</Label>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {availableRoles.map(role => (
                                    <div 
                                        key={role} 
                                        className={cn(
                                            "flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer",
                                            formData.roles.includes(role) 
                                                ? "bg-primary/10 border-primary/50 shadow-inner" 
                                                : "bg-background/30 border-border/50 hover:bg-muted/50"
                                        )}
                                        onClick={() => handleRoleChange(role)}
                                    >
                                        <Checkbox
                                            id={`role-${role}`}
                                            checked={formData.roles.includes(role)}
                                            onCheckedChange={() => handleRoleChange(role)}
                                            className="h-5 w-5"
                                        />
                                        <Label 
                                            htmlFor={`role-${role}`}
                                            className="text-xs font-black uppercase tracking-widest cursor-pointer flex-1"
                                        >
                                            {role.replace('_', ' ')}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {formData.roles.length === 0 && (
                                <p className="text-[10px] text-destructive font-bold uppercase tracking-tighter italic">Critical: System requires at least one assigned role.</p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20 font-bold flex items-center gap-2">
                            <X className="h-4 w-4 shrink-0" />
                            {error.message || 'Operational failure during synchronization.'}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border/50">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="h-11 font-bold uppercase tracking-widest text-xs order-2 sm:order-1">
                            <X className="mr-2 h-3 w-3" /> Abort
                        </Button>
                        <Button type="submit" disabled={loading || formData.roles.length === 0} className="h-11 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 min-w-[160px] order-1 sm:order-2">
                            <Save className="mr-2 h-3 w-3" /> {loading ? 'Synchronizing...' : 'Commit Personnel Data'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default UserForm;
