import React, { useState } from 'react';
import { Users, Shield } from 'lucide-react';
import UserList from '@/components/workshop/users/UserList';
import UserForm from '@/components/workshop/users/UserForm';
import RoleList from '@/components/workshop/roles/RoleList';
import RoleForm from '@/components/workshop/roles/RoleForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const Manage = () => {
    const [userView, setUserView] = useState('list');
    const [roleView, setRoleView] = useState('list');
    const [selectedUser, setSelectedUser] = useState(null);
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
        setUserListKey(Date.now()); // Force re-render of UserList
    };

    const handleCreateRole = () => {
        setRoleView('form');
    };

    const handleRoleFormCancel = () => {
        setRoleView('list');
    };

    const handleRoleFormSave = () => {
        setRoleView('list');
        setRoleListKey(Date.now()); // Force re-render of RoleList
        setUserListKey(Date.now()); // Force re-render of UserList to update roles dropdown
    };

    const handleRoleDeleted = () => {
        setUserListKey(Date.now()); // Force re-render of UserList to update roles dropdown
    }

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
                return <RoleList key={roleListKey} onCreate={handleCreateRole} onRoleDeleted={handleRoleDeleted} />;
            case 'form':
                return <RoleForm onCancel={handleRoleFormCancel} onSave={handleRoleFormSave} />;
            default:
                return <RoleList key={roleListKey} onCreate={handleCreateRole} onRoleDeleted={handleRoleDeleted} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Manage</h1>
                    <p className="text-muted-foreground">Manage users and roles.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" /> Users</TabsTrigger>
                    <TabsTrigger value="roles"><Shield className="mr-2 h-4 w-4" /> Roles</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    <Card>
                        <CardContent className="pt-6">
                            {renderUserContent()}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="roles">
                    <Card>
                        <CardContent className="pt-6">
                            {renderRoleContent()}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Manage;
