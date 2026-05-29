import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { workshopMgmtService } from '@/services/workshopMgmtService';
import { UserPlus, Save, X, ShieldCheck } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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
                // TODO: Implement update in workshopMgmtService if needed
                // await workshopMgmtService.updateUser(user.id, formData);
                console.warn('Update user not implemented in backend controller for /api/manage yet.');
                setError({ message: 'User update not supported via this form yet. Use onboarding or global user management.' });
            } else {
                await workshopMgmtService.createUser(null, formData);
                onSave();
            }
        } catch (err) {
            console.error('Error saving user:', err);
            setError(err.response?.data || { message: 'Failed to save user.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-none">
            <CardHeader className="px-0">
                <div className="flex items-center gap-2 text-primary">
                    <UserPlus className="h-5 w-5" />
                    <CardTitle>{user ? 'Edit Staff Member' : 'Add New Staff Member'}</CardTitle>
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
                            <Input id="firstName" value={formData.firstName} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" value={formData.lastName} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                        {!user && (
                            <div className="space-y-2">
                                <Label htmlFor="password">Initial Password</Label>
                                <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
                            </div>
                        )}
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea id="address" value={formData.address} onChange={handleChange} rows={2} required />
                        </div>
                        
                        <div className="md:col-span-2 space-y-3">
                            <div className="flex items-center gap-2 border-b pb-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                <Label className="text-base font-semibold">Assign Roles</Label>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                                {availableRoles.map(role => (
                                    <div key={role} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors">
                                        <Checkbox
                                            id={`role-${role}`}
                                            checked={formData.roles.includes(role)}
                                            onCheckedChange={() => handleRoleChange(role)}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label 
                                                htmlFor={`role-${role}`}
                                                className="text-sm font-medium leading-none cursor-pointer uppercase text-[10px]"
                                            >
                                                {role.replace('_', ' ')}
                                            </Label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {formData.roles.length === 0 && (
                                <p className="text-[10px] text-destructive italic">At least one role must be assigned.</p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-100">
                            {error.message || 'An error occurred while saving.'}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                            <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button type="submit" disabled={loading || formData.roles.length === 0}>
                            <Save className="mr-2 h-4 w-4" /> {loading ? 'Saving...' : 'Save Member'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default UserForm;
