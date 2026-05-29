import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { workshopMgmtService } from '@/services/workshopMgmtService';
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/badge";

const RolePermissions = ({ roleName, onBack }) => {
    const [permissions, setPermissions] = useState([]);
    const [allPermissions, setAllPermissions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [rolePerms, allPerms] = await Promise.all([
                    workshopMgmtService.getPermissionsForRole(roleName),
                    workshopMgmtService.listAllPermissions()
                ]);
                setPermissions(rolePerms);
                setAllPermissions(allPerms);
            } catch (err) {
                console.error('Error loading permissions:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [roleName]);

    if (loading) return <LoadingSpinner />;

    if (error) {
        return <div className="text-red-500 text-center p-4">Error loading permissions: {error.message}</div>;
    }

    return (
        <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Roles
            </Button>
            
            <CardHeader className="px-0">
                <div className="flex items-center gap-2">
                    <Badge className="text-lg px-3 py-1 capitalize">
                        {roleName.replace('_', ' ').toLowerCase()}
                    </Badge>
                </div>
                <CardDescription>
                    Assigned permissions for this role. These are enforced across the entire system.
                </CardDescription>
            </CardHeader>

            <CardContent className="px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(allPermissions).map(([key, description]) => {
                        const isAssigned = permissions.includes(key);
                        return (
                            <div 
                                key={key} 
                                className={`flex items-center p-3 rounded-lg border ${
                                    isAssigned ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 text-muted-foreground border-transparent opacity-60'
                                }`}
                            >
                                <div className={`mr-3 ${isAssigned ? 'text-primary' : 'text-muted-foreground'}`}>
                                    <CheckCircle2 className={`h-5 w-5 ${isAssigned ? 'opacity-100' : 'opacity-20'}`} />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{description}</p>
                                    <p className="text-[10px] uppercase tracking-wider">{key}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </div>
    );
};

export default RolePermissions;
