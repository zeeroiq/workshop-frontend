import React, { useState } from 'react';
import { Users, Shield } from 'lucide-react';
import UserList from '@/components/workshop/users/UserList';
import UserForm from '@/components/workshop/users/UserForm';
import RoleList from '@/components/workshop/roles/RoleList';
import RolePermissions from '@/components/workshop/roles/RolePermissions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="w-full bg-muted/30 border-border/50 p-1 mb-6">
                    <TabsTrigger value="users" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold">
                        <Users className="mr-2 h-4 w-4" /> Users & Staff
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold">
                        <Shield className="mr-2 h-4 w-4" /> System Roles
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="users" className="mt-0 focus-visible:ring-0">
                    {renderUserContent()}
                </TabsContent>
                <TabsContent value="roles" className="mt-0 focus-visible:ring-0">
                    {renderRoleContent()}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Manage;
