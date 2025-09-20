import React, { useState } from 'react';
import {
    FaBox,
    FaTruck,
    FaUsers,
    FaList,
    // FaEdit,
    // FaEye,
    // FaPlus,
    // FaSearch,
    // FaTrash
} from 'react-icons/fa';
import PartList from './parts/PartList';
import PartForm from './parts/PartForm';
import PartDetails from './parts/PartDetails';
import SupplierList from './suppliers/SupplierList';
import SupplierForm from './suppliers/SupplierForm';
import PurchaseOrderList from './orders/PurchaseOrderList';
import PurchaseOrderForm from './orders/PurchaseOrderForm';
import PurchaseOrderDetails from './orders/PurchaseOrderDetails';
import '../../styles/inventory/Inventory.css';
import SupplierDetails from "./suppliers/SupplierDetails";

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`inventory-tabpanel-${index}`}
            aria-labelledby={`inventory-tab-${index}`}
            {...other}
        >
            {value === index && <div className="tab-content">{children}</div>}
        </div>
    );
}

const Inventory = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [currentView, setCurrentView] = useState('list');
    const [selectedItem, setSelectedItem] = useState(null);
    const [editItem, setEditItem] = useState(null);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        setCurrentView('list');
        setSelectedItem(null);
        setEditItem(null);
    };

    const handleViewDetails = (item) => {
        setSelectedItem(item);
        setCurrentView('details');
    };

    const handleEdit = (item) => {
        setEditItem(item);
        setCurrentView('form');
    };

    const handleCreate = () => {
        setEditItem(null);
        setCurrentView('form');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedItem(null);
        setEditItem(null);
    };

    const handleSave = () => {
        // In a real app, this would save to the backend
        setCurrentView('list');
        setSelectedItem(null);
        setEditItem(null);
    };

    const renderPartViews = () => {
        switch (currentView) {
            case 'list':
                return (
                    <PartList
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onCreate={handleCreate}
                    />
                );
            case 'details':
                return (
                    <PartDetails
                        part={selectedItem}
                        onBack={handleBackToList}
                        onEdit={() => handleEdit(selectedItem)}
                    />
                );
            case 'form':
                return (
                    <PartForm
                        part={editItem}
                        onSave={handleSave}
                        onCancel={handleBackToList}
                    />
                );
            default:
                return <PartList onCreate={handleCreate} />;
        }
    };

    const renderSupplierViews = () => {
        switch (currentView) {
            case 'list':
                return (
                    <SupplierList
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onCreate={handleCreate}
                    />
                );
            case 'details':
                return (
                <SupplierDetails
                    supplier={selectedItem}
                    onBack={handleBackToList}
                    onEdit={() => handleEdit(selectedItem)}
                />
                );
            case 'form':
                return (
                    <SupplierForm
                        supplier={editItem}
                        onSave={handleSave}
                        onCancel={handleBackToList}
                    />
                );
            default:
                return <SupplierList onCreate={handleCreate} />;
        }
    };

    const renderPurchaseOrderViews = () => {
        switch (currentView) {
            case 'list':
                return (
                    <PurchaseOrderList
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onCreate={handleCreate}
                    />
                );
            case 'details':
                return (
                    <PurchaseOrderDetails
                        order={selectedItem}
                        onBack={handleBackToList}
                        onEdit={() => handleEdit(selectedItem)}
                    />
                );
            case 'form':
                return (
                    <PurchaseOrderForm
                        order={editItem}
                        onSave={handleSave}
                        onCancel={handleBackToList}
                    />
                );
            default:
                return <PurchaseOrderList onCreate={handleCreate} />;
        }
    };

    return (
        <div className="inventory-module">
            <div className="module-header">
                <FaBox className="module-icon" />
                <h2>Inventory Management</h2>
            </div>

            <div className="inventory-tabs">
                <button
                    className={currentTab === 0 ? 'active' : ''}
                    onClick={() => handleTabChange(null, 0)}
                >
                    <FaList /> Parts
                </button>
                <button
                    className={currentTab === 1 ? 'active' : ''}
                    onClick={() => handleTabChange(null, 1)}
                >
                    <FaUsers /> Suppliers
                </button>
                <button
                    className={currentTab === 2 ? 'active' : ''}
                    onClick={() => handleTabChange(null, 2)}
                >
                    <FaTruck /> Purchase Orders
                </button>
            </div>

            <div className="inventory-content">
                <TabPanel value={currentTab} index={0}>
                    {renderPartViews()}
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                    {renderSupplierViews()}
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                    {renderPurchaseOrderViews()}
                </TabPanel>
            </div>
        </div>
    );
};

export default Inventory;