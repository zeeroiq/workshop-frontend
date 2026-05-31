import React, { useState } from 'react';
import { Box, Truck, Users, List } from 'lucide-react';
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
import { Card, CardContent } from "@/components/ui/card";

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
        <div className="space-y-6 max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">Inventory Management</h1>
                    <p className="text-sm md:text-base text-muted-foreground font-medium">Stock levels, procurement & logistics intelligence.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="parts" className="flex-1 sm:flex-none"><List className="mr-2 h-4 w-4" /> Parts</TabsTrigger>
                    <TabsTrigger value="suppliers" className="flex-1 sm:flex-none"><Users className="mr-2 h-4 w-4" /> Suppliers</TabsTrigger>
                    <TabsTrigger value="orders" className="flex-1 sm:flex-none"><Truck className="mr-2 h-4 w-4" /> Purchase Orders</TabsTrigger>
                </TabsList>
                
                <TabsContent value="parts" className="mt-6">
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardContent className="p-0 sm:p-6">
                            {renderPartViews()}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="suppliers" className="mt-6">
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardContent className="p-0 sm:p-6">
                            {renderSupplierViews()}
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="orders" className="mt-6">
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                        <CardContent className="p-0 sm:p-6">
                            {renderPurchaseOrderViews()}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Inventory;
