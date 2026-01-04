import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { workshopMgmtService } from '@/services/workshopMgmtService';
import LoadingSpinner from "@/components/common/LoadingSpinner";

const RoleList = ({ onCreate, onRoleDeleted }) => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await workshopMgmtService.listAllRoles();
            setRoles(response.data || []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleDelete = async (roleName) => {
        if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
            try {
                await workshopMgmtService.deleteRole(roleName);
                onRoleDeleted();
                fetchRoles(); // Refetch roles after deletion
            } catch (err) {
                setError(err);
                alert(`Failed to delete role: ${err.message}`);
            }
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">Error loading roles: {error.message}</div>;
    }

    return (
        <>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Roles</CardTitle>
                <Button onClick={onCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Role
                </Button>
            </CardHeader>
            {roles.length === 0 ? (
                <div className="text-center p-4">
                    No roles found.
                    <Button variant="link" onClick={onCreate}>Add a new role</Button>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map(role => (
                            <TableRow key={role}>
                                <TableCell>{role}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(role)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </>
    );
};

export default RoleList;
