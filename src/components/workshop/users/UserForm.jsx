import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { workshopMgmtService } from '@/services/workshopMgmtService';
import { UserPlus, Save, X, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

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
                roles: Array.isArray(user.roles) ? user.roles.map(r => r.replace('ROLE_', '')) : [],
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

    const handleRoleToggle = useCallback((roleName) => {
        setFormData(prev => {
            const currentRoles = prev.roles || [];
            const isSelected = currentRoles.includes(roleName);
            const newRoles = isSelected
                ? currentRoles.filter(r => r !== roleName)
                : [...currentRoles, roleName];
            return { ...prev, roles: newRoles };
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.roles.length === 0) {
            toast.warn('Please assign at least one role.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            if (user) {
                await workshopMgmtService.updateUser(null, user.id, formData);
                toast.success('Staff member updated successfully');
                onSave();
            } else {
                await workshopMgmtService.createUser(null, formData);
                toast.success('Staff member added successfully');
                onSave();
            }
        } catch (err) {
            console.error('Error saving user:', err);
            const errorMsg = err.response?.data?.message || 'Failed to save user.';
            setError({ message: errorMsg });
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
                <div className="flex items-center gap-2 text-emerald-500">
                    <UserPlus className="h-5 w-5" />
                    <CardTitle className="text-foreground">{user ? 'Edit Staff Member' : 'Add New Staff Member'}</CardTitle>
                </div>
                <CardDescription>
                    Provide details and assign roles to give your staff access to the system.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" value={formData.firstName} onChange={handleChange} required className="bg-muted/30 border-border/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" value={formData.lastName} onChange={handleChange} className="bg-muted/30 border-border/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} required className="bg-muted/30 border-border/50" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} required className="bg-muted/30 border-border/50" />
                        </div>
                        {!user && (
                            <div className="space-y-2">
                                <Label htmlFor="password">Initial Password</Label>
                                <Input id="password" type="password" value={formData.password} onChange={handleChange} required className="bg-muted/30 border-border/50" />
                            </div>
                        )}
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" value={formData.address} onChange={handleChange} rows={2} required className="bg-muted/30 border-border/50" />
                        </div>
                        
                        <div className="md:col-span-2 space-y-3">
                            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                <Label className="text-base font-semibold">Assign Roles</Label>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                                {availableRoles.map(role => {
                                    const isChecked = formData.roles.includes(role);
                                    return (
                                        <div 
                                            key={role} 
                                            className="flex items-center space-x-3 p-3 rounded-xl border border-border/50 hover:bg-emerald-500/5 transition-all cursor-pointer group"
                                            onClick={() => handleRoleToggle(role)}
                                        >
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    id={`role-${role}`}
                                                    checked={isChecked}
                                                    onCheckedChange={() => handleRoleToggle(role)}
                                                    className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-colors"
                                                />
                                            </div>
                                            <Label 
                                                htmlFor={`role-${role}`}
                                                className="text-[10px] font-black uppercase tracking-widest cursor-pointer group-hover:text-emerald-500 transition-colors flex-1"
                                                onClick={(e) => e.preventDefault()} 
                                            >
                                                {role.replace('_', ' ')}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                            {formData.roles.length === 0 && (
                                <p className="text-[10px] text-destructive italic font-bold">At least one role must be assigned.</p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm border border-destructive/20 font-medium">
                            {error.message || 'An error occurred while saving.'}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={loading} className="border-border/50">
                            <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button type="submit" disabled={loading || formData.roles.length === 0} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                            <Save className="mr-2 h-4 w-4" /> {loading ? 'Saving...' : user ? 'Update Staff' : 'Save Member'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default UserForm;
