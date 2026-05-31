import React, { useState } from 'react';
import { Users, Shield, UserPlus, ShieldAlert, Key, Lock } from 'lucide-react';
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
        <div className="space-y-8 w-full max-w-screen-2xl mx-auto pb-12">
            {/* Responsive Header Node */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                        <Lock className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Governance Node Access</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tight uppercase leading-none">Security & Personnel</h1>
                    <p className="text-sm md:text-lg text-muted-foreground font-medium opacity-70">Define system access control and manage staff identity matrix.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="bg-card/30 border-border/50 shadow-lg">
                    <TabsTrigger value="users" className="flex-1 sm:flex-none">
                        <Users className="mr-2 h-4 w-4" /> Identity Registry
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="flex-1 sm:flex-none">
                        <Shield className="mr-2 h-4 w-4" /> Role Governance
                    </TabsTrigger>
                </TabsList>
                
                <div className="mt-8">
                    <TabsContent value="users" className="animate-in fade-in duration-500">
                        <Card className="border-border/50 shadow-2xl overflow-hidden bg-card/30 backdrop-blur-md rounded-[2rem]">
                            <CardContent className="p-0 sm:p-8">
                                {renderUserContent()}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="roles" className="animate-in fade-in duration-500">
                        <Card className="border-border/50 shadow-2xl overflow-hidden bg-card/30 backdrop-blur-md rounded-[2rem]">
                            <CardContent className="p-0 sm:p-8">
                                {renderRoleContent()}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
};

export default Manage;
