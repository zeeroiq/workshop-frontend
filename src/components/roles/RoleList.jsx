import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';

const roles = [
    { id: 1, name: 'Admin', description: 'Full access to all features' },
    { id: 2, name: 'Mechanic', description: 'Can view and update job statuses' },
    { id: 3, name: 'Workshop Manager', description: 'Manages mechanics and job assignments' },
];

const RoleList = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Roles</CardTitle>
                    <Button onClick={() => navigate('/manage/roles/new')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Role
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map(role => (
                                <TableRow key={role.id}>
                                    <TableCell>{role.name}</TableCell>
                                    <TableCell>{role.description}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm" onClick={() => navigate(`/manage/roles/edit/${role.id}`)}>Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default RoleList;
