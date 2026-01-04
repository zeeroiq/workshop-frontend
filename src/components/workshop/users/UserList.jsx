import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import { workshopMgmtService } from '@/services/workshopMgmtService';
import LoadingSpinner from "@/components/common/LoadingSpinner";

const UserList = ({ onEdit, onCreate }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await workshopMgmtService.listAll();
                setUsers(response.data || []);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">Error loading users: {error.message}</div>;
    }

    return (
        <>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Workshop Users</CardTitle>
                <Button onClick={onCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </CardHeader>
            {users.length === 0 ? (
                <div className="text-center p-4">
                    No users found.
                    <Button variant="link" onClick={onCreate}>Add a new user</Button>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phone}</TableCell>
                                <TableCell>{Array.isArray(user.roles) ? user.roles.join(', ') : user.roles}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm" onClick={() => onEdit(user)}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    );
};

export default UserList;
