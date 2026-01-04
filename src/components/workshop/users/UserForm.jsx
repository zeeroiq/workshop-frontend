import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { workshopMgmtService } from '../../../services/workshopMgmtService';

const UserForm = ({ user, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        idVerification: '',
        roles: [],
        password: '',
    });
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("User prop in UserForm:", user);
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || '',
                idVerification: user.idVerification || '',
                roles: Array.isArray(user.roles) ? user.roles : [],
                password: '',
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await workshopMgmtService.listAllRoles();
                console.log("Available roles from API:", response.data);
                setRoles(response.data || []);
            } catch (err) {
                console.error("Error fetching roles:", err);
            }
        };
        fetchRoles();
    }, []);

    useEffect(() => {
        console.log("Current formData.role:", formData.roles);
    }, [formData.roles]);

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
                await workshopMgmtService.update(user.id, formData);
            } else {
                await workshopMgmtService.create(formData);
            }
            onSave();
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{user ? 'Edit User' : 'Add User'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                            <Input id="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter user's first name" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter user's last name" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter user's email" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="Enter user's phone number" required />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                            <Textarea id="address" value={formData.address} onChange={handleChange} placeholder="Enter user's address" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="idVerification">ID (for verification)</Label>
                            <Input id="idVerification" value={formData.idVerification} onChange={handleChange} placeholder="Enter user's ID" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Roles <span className="text-red-500">*</span></Label>
                            <div className="flex flex-wrap gap-4">
                                {roles.map(role => (
                                    <div key={role} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`role-${role}`}
                                            checked={formData.roles.includes(role)}
                                            onCheckedChange={() => handleRoleChange(role)}
                                        />
                                        <Label htmlFor={`role-${role}`}>{role}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password {user ? '(leave blank to keep current)' : <span className="text-red-500">*</span>}</Label>
                            <Input id="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter a dummy password" required={!user} />
                        </div>
                    </div>
                    {error && <div className="text-red-500 mt-4">{error.message}</div>}
                    <div className="flex justify-end mt-4 gap-2">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save User'}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default UserForm;
