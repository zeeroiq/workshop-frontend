import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, Eye } from 'lucide-react';
import { workshopMgmtService } from '@/services/workshopMgmtService';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/badge";

const RoleList = ({ onViewPermissions }) => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const data = await workshopMgmtService.listRoles();
            setRoles(data || []);
        } catch (err) {
            console.error('Error loading roles:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    if (loading) return <LoadingSpinner />;

    if (error) {
        return <div className="text-red-500 text-center p-4 border rounded bg-red-50">Error loading roles: {error.message}</div>;
    }

    return (
        <>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle>System Roles</CardTitle>
                </div>
                <CardDescription>
                    Predefined roles with fixed permission sets. Use these to control access for your staff.
                </CardDescription>
            </CardHeader>
            <div className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Role Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map(role => (
                            <TableRow
                                key={role}
                                className="cursor-pointer"
                                onClick={() => onViewPermissions(role)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' || event.key === ' ') {
                                        event.preventDefault();
                                        onViewPermissions(role);
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                            >
                                <TableCell className="font-medium">
                                    <Badge variant="outline" className="capitalize">
                                        {role.replace('_', ' ').toLowerCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {getRoleDescription(role)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={(e) => {
                                        e.stopPropagation();
                                        onViewPermissions(role);
                                    }}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Permissions
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
};

const getRoleDescription = (role) => {
    switch(role) {
        case 'ADMIN': return 'Full system access and workshop management.';
        case 'MANAGER': return 'Manage daily operations, reports, and staff users.';
        case 'MECHANIC': return 'View assigned jobs and update vehicle service status.';
        case 'RECEPTIONIST': return 'Handle customer intake, vehicle registration, and payments.';
        case 'SERVICE_ADVISOR': return 'Create jobs, manage customer interaction and estimates.';
        case 'CUSTOMER': return 'View own vehicle status and service history.';
        default: return 'Custom system role.';
    }
};

export default RoleList;
