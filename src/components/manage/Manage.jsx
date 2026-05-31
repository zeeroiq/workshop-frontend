import React, { useState } from 'react';
import { Users, Shield, UserPlus, ShieldAlert } from 'lucide-react';
import UserList from '@/components/workshop/users/UserList';
import UserForm from '@/components/workshop/users/UserForm';
import RoleList from '@/components/workshop/roles/RoleList';
import RolePermissions from '@/components/workshop/roles/RolePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const Manage = () => {
    const [userView, setUserView] = useState('list');
    const [roleView, setRoleView] = useState('list');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [activeTab, setActiveTab] = useState('users');
    const [userListKey, setUserListKey] = useState(Date.now());
    const [roleListKey, setRoleListKey] = useState(Date.now());

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setUserView('form');
    };

    const handleCreateUser = () => {
        setSelectedUser(null);
        setUserView('form');
    };

    const handleUserFormCancel = () => {
        setUserView('list');
    };

    const handleUserFormSave = () => {
        setUserView('list');
        setUserListKey(Date.now());
    };

    const handleViewPermissions = (role) => {
        setSelectedRole(role);
        setRoleView('permissions');
    };

    const handlePermissionsBack = () => {
        setRoleView('list');
        setSelectedRole(null);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setUserView('list');
        setRoleView('list');
    };

    const renderUserContent = () => {
        switch (userView) {
            case 'list':
                return <UserList key={userListKey} onEdit={handleEditUser} onCreate={handleCreateUser} />;
            case 'form':
                return <UserForm user={selectedUser} onCancel={handleUserFormCancel} onSave={handleUserFormSave} />;
            default:
                return <UserList key={userListKey} onEdit={handleEditUser} onCreate={handleCreateUser} />;
        }
    };

    const renderRoleContent = () => {
        switch (roleView) {
            case 'list':
                return <RoleList key={roleListKey} onViewPermissions={handleViewPermissions} />;
            case 'permissions':
                return <RolePermissions roleName={selectedRole} onBack={handlePermissionsBack} />;
            default:
                return <RoleList key={roleListKey} onViewPermissions={handleViewPermissions} />;
        }
    };

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">Personnel & Security</h1>
                <p className="text-sm md:text-base text-muted-foreground font-medium">Manage workshop staff identities and operational permission matrix.</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="users" className="flex-1 sm:flex-none">
                        <Users className="mr-2 h-4 w-4" /> Staff Directory
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="flex-1 sm:flex-none">
                        <Shield className="mr-2 h-4 w-4" /> Role Governance
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="users" className="mt-6 animate-in fade-in duration-300">
                    <Card className="border-border/50 shadow-sm overflow-hidden bg-card/30 backdrop-blur-sm">
                        <CardContent className="p-0 sm:p-6">
                            {renderUserContent()}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="roles" className="mt-6 animate-in fade-in duration-300">
                    <Card className="border-border/50 shadow-sm overflow-hidden bg-card/30 backdrop-blur-sm">
                        <CardContent className="p-0 sm:p-6">
                            {renderRoleContent()}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Manage;
