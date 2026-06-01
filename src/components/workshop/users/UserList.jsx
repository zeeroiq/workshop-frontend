import React, { useState, useEffect } from 'react';
import { Edit, UserPlus, Mail, Phone, ShieldCheck } from 'lucide-react';
import { workshopMgmtService } from '@/services/workshopMgmtService';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';

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

    const columns = [
        {
            header: "Staff Member",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{row.firstName} {row.lastName}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">@{row.username}</span>
                </div>
            )
        },
        {
            header: "Contact",
            cell: (row) => (
                <div className="flex flex-col text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Mail size={12} /> {row.email}</div>
                    <div className="flex items-center gap-1"><Phone size={12} /> {row.phone}</div>
                </div>
            )
        },
        {
            header: "Roles",
            cell: (row) => (
                <div className="flex flex-wrap gap-1">
                    {(Array.isArray(row.roles) ? row.roles : [row.roles]).map(role => (
                        <Badge key={role} variant="secondary" className="text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none">
                            {role.replace('ROLE_', '')}
                        </Badge>
                    ))}
                </div>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (row, isTablet) => (
                <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" onClick={() => onEdit(row)}>
                    <Edit className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {!isTablet && <span className="ml-2">Edit</span>}
                </Button>
            )
        }
    ];

    const renderUserCard = (user) => (
        <Card 
            className="overflow-hidden border-border/50 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => onEdit(user)}
        >
            <CardHeader className="pb-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg group-hover:text-emerald-500 transition-colors">
                    {user.firstName} {user.lastName}
                </CardTitle>
                <Badge variant="outline" className="text-[10px]">@{user.username}</Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="col-span-2 flex flex-wrap gap-1">
                        {(Array.isArray(user.roles) ? user.roles : [user.roles]).map(role => (
                            <Badge key={role} className="text-[9px] uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none">
                                {role.replace('ROLE_', '')}
                            </Badge>
                        ))}
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Email</p>
                        <p className="font-medium truncate text-xs">{user.email}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Phone</p>
                        <p className="font-medium text-xs">{user.phone}</p>
                    </div>
                </div>
                
                <div className="pt-4 border-t border-border/50">
                    <Button variant="outline" className="w-full h-11 gap-2 border-border/50" onClick={(e) => { e.stopPropagation(); onEdit(user); }}>
                        <Edit size={16} />
                        <span>Edit Profile</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    const actions = (
        <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 gap-2">
            <UserPlus size={16} />
            <span>Add Staff</span>
        </Button>
    );

    return (
        <div className="pb-6">
            <ResponsiveDataContainer
                title="Staff Members"
                description="Manage your workshop team and their access levels"
                actions={actions}
                columns={columns}
                data={users}
                renderCard={renderUserCard}
                onRowClick={onEdit}
                loading={loading}
                emptyMessage="No staff members found. Click 'Add Staff' to onboard your team."
            />
            {error && (
                <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
                    {error.message || 'Failed to load users.'}
                </div>
            )}
        </div>
    );
};

export default UserList;
