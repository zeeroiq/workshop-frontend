import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { workshopMgmtService } from '@/services/workshopMgmtService';

const RoleForm = ({ onCancel, onSave }) => {
    const [roleName, setRoleName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await workshopMgmtService.createRole(roleName);
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
                <CardTitle>Add Role</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Role Name</Label>
                            <Input
                                id="name"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="Enter the role name"
                                required
                            />
                        </div>
                    </div>
                    {error && <div className="text-red-500 mt-4">{error.message}</div>}
                    <div className="flex justify-end mt-4 gap-2">
                        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Role'}</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default RoleForm;
