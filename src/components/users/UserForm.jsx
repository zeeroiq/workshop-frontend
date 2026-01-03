import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const UserForm = () => {
    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Add User</CardTitle>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                                <Input id="firstName" placeholder="Enter user's first name" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" placeholder="Enter user's last name" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="Enter user's email" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                                <Input id="phone" placeholder="Enter user's phone number" required />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="address">Address <span className="text-red-500">*</span></Label>
                                <Textarea id="address" placeholder="Enter user's address" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="id-verification">ID (for verification)</Label>
                                <Input id="id-verification" placeholder="Enter user's ID" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                                <Select required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="mechanic">Mechanic</SelectItem>
                                        <SelectItem value="workshop-manager">Workshop Manager</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                                <Input id="password" type="password" placeholder="Enter a dummy password" required />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button type="submit">Save User</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserForm;
