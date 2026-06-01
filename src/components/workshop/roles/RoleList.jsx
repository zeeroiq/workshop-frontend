import React, { useState, useEffect } from 'react';
import { Shield, Eye, ShieldCheck } from 'lucide-react';
import { workshopMgmtService } from '@/services/workshopMgmtService';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';

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

    const columns = [
        {
            header: "Role Name",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <Badge variant="outline" className="capitalize font-bold border-emerald-500/20 bg-emerald-500/5">
                        {row.replace('_', ' ').toLowerCase()}
                    </Badge>
                </div>
            )
        },
        {
            header: "Description",
            cell: (row) => <span className="text-sm text-muted-foreground">{getRoleDescription(row)}</span>
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (row, isTablet) => (
                <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" onClick={() => onViewPermissions(row)}>
                    <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {!isTablet && <span className="ml-2">Permissions</span>}
                </Button>
            )
        }
    ];

    const renderRoleCard = (role) => (
        <Card 
            className="overflow-hidden border-border/50 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => onViewPermissions(role)}
        >
            <CardHeader className="pb-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Shield size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <CardTitle className="text-lg group-hover:text-emerald-500 transition-colors capitalize">
                        {role.replace('_', ' ').toLowerCase()}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {getRoleDescription(role)}
                </p>
                
                <div className="pt-4 border-t border-border/50">
                    <Button variant="outline" className="w-full h-11 gap-2 border-border/50" onClick={(e) => { e.stopPropagation(); onViewPermissions(role); }}>
                        <ShieldCheck size={16} />
                        <span>View Permissions</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="pb-6">
            <ResponsiveDataContainer
                title="System Roles"
                description="Predefined roles with fixed permission sets enforced across the platform"
                columns={columns}
                data={roles}
                renderCard={renderRoleCard}
                onRowClick={onViewPermissions}
                loading={loading}
                emptyMessage="No roles found."
            />
            {error && (
                <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
                    {error.message || 'Failed to load roles.'}
                </div>
            )}
        </div>
    );
};

export default RoleList;
