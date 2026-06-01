import React, { useState } from 'react';
import { Truck, Users, List } from 'lucide-react';
import PartList from './parts/PartList';
import PartForm from './parts/PartForm';
import PartDetails from './parts/PartDetails';
import SupplierList from './suppliers/SupplierList';
import SupplierForm from './suppliers/SupplierForm';
import PurchaseOrderList from './orders/PurchaseOrderList';
import PurchaseOrderForm from './orders/PurchaseOrderForm';
import PurchaseOrderDetails from './orders/PurchaseOrderDetails';
import SupplierDetails from "./suppliers/SupplierDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Inventory = () => {
    const [currentView, setCurrentView] = useState('list');
    const [selectedItem, setSelectedItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [activeTab, setActiveTab] = useState('parts');

    const handleViewDetails = (item) => {
        setSelectedItem(item);
        setCurrentView('details');
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setCurrentView('form');
    };

    const handleCreate = (initialData = null) => {
        setEditItem(initialData);
        setCurrentView('form');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedItem(null);
        setEditItem(null);
    };

    const handleSave = () => {
        setCurrentView('list');
        setSelectedItem(null);
        setEditItem(null);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setCurrentView('list');
        setSelectedItem(null);
        setEditItem(null);
    };

    const renderPartViews = () => {
        switch (currentView) {
            case 'list':
                return <PartList onViewDetails={handleViewDetails} onEdit={handleEdit} onCreate={handleCreate} />;
            case 'details':
                return <PartDetails part={selectedItem} onBack={handleBackToList} onEdit={() => handleEdit(selectedItem)} />;
            case 'form':
                return <PartForm part={editItem} onSave={handleSave} onCancel={handleBackToList} />;
            default:
                return <PartList onCreate={handleCreate} />;
        }
    };

    const renderSupplierViews = () => {
        switch (currentView) {
            case 'list':
                return <SupplierList onViewDetails={handleViewDetails} onEdit={handleEdit} onCreate={handleCreate} />;
            case 'details':
                return <SupplierDetails supplier={selectedItem} onBack={handleBackToList} onEdit={() => handleEdit(selectedItem)} />;
            case 'form':
                return <SupplierForm supplier={editItem} onSave={handleSave} onCancel={handleBackToList} />;
            default:
                return <SupplierList onCreate={handleCreate} />;
        }
    };

    const renderPurchaseOrderViews = () => {
        switch (currentView) {
            case 'list':
                return <PurchaseOrderList onViewDetails={handleViewDetails} onEdit={handleEdit} onCreate={handleCreate} />;
            case 'details':
                return <PurchaseOrderDetails order={selectedItem} onBack={handleBackToList} onEdit={() => handleEdit(selectedItem)} />;
            case 'form':
                return <PurchaseOrderForm order={editItem} onSave={handleSave} onCancel={handleBackToList} />;
            default:
                return <PurchaseOrderList onCreate={handleCreate} />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Inventory Management</h1>
                    <p className="text-muted-foreground">Manage your parts, suppliers, and purchase orders.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="w-full bg-muted/30 border-border/50 p-1 mb-6">
                    <TabsTrigger value="parts" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold">
                        <List className="mr-2 h-4 w-4" /> Parts
                    </TabsTrigger>
                    <TabsTrigger value="suppliers" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold">
                        <Users className="mr-2 h-4 w-4" /> Suppliers
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-emerald-950 font-bold">
                        <Truck className="mr-2 h-4 w-4" /> Orders
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="parts" className="mt-0">
                    {renderPartViews()}
                </TabsContent>
                <TabsContent value="suppliers" className="mt-0">
                    {renderSupplierViews()}
                </TabsContent>
                <TabsContent value="orders" className="mt-0">
                    {renderPurchaseOrderViews()}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Inventory;
