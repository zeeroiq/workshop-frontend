import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit } from 'lucide-react';
import { workshopMgmtService } from '@/services/workshopMgmtService';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/badge";

const UserList = ({ onEdit, onCreate }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await workshopMgmtService.listUsers();
            setUsers(data || []);
        } catch (err) {
            console.error('Error loading users:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <LoadingSpinner />;

    if (error) {
        return <div className="text-red-500 text-center p-4">Error loading users: {error.message}</div>;
    }

    return (
        <>
            <CardHeader className="flex flex-row items-center justify-between px-0">
                <CardTitle>Staff Members</CardTitle>
                <Button onClick={onCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Staff
                </Button>
            </CardHeader>
            <div className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    <div>{user.firstName} {user.lastName}</div>
                                    <div className="text-xs text-muted-foreground">@{user.username}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">{user.email}</div>
                                    <div className="text-xs text-muted-foreground">{user.phone}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {(Array.isArray(user.roles) ? user.roles : [user.roles]).map(role => (
                                            <Badge key={role} variant="secondary" className="text-[10px] uppercase">
                                                {role.replace('ROLE_', '')}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                    No staff members found. Click "Add Staff" to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
};

export default UserList;
