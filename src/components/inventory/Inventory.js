import React, { useState } from 'react';
import {
    Box,
    Tabs,
    Tab,
    Paper,
    Typography,
    IconButton,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    People as PeopleIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import PartList from './PartList';
import PartForm from './PartForm';
import PartDetails from './PartDetails';
import SupplierList from './SupplierList';
import SupplierForm from './SupplierForm';
import PurchaseOrderList from './PurchaseOrderList';
import PurchaseOrderForm from './PurchaseOrderForm';
import PurchaseOrderDetails from './PurchaseOrderDetails';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`inventory-tabpanel-${index}`}
            aria-labelledby={`inventory-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `inventory-tab-${index}`,
        'aria-controls': `inventory-tabpanel-${index}`,
    };
}

const Inventory = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [currentView, setCurrentView] = useState('list');
    const [selectedItem, setSelectedItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
                    <PartDetails
                        part={selectedItem}
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
        <Box sx={{ flexGrow: 1, p: isMobile ? 1 : 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <InventoryIcon sx={{ mr: 1, fontSize: '2rem' }} />
                <Typography variant="h4" component="h1">
                    Inventory Management
                </Typography>
            </Box>

            <Paper sx={{ width: '100%', mb: 2 }}>
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant={isMobile ? "scrollable" : "fullWidth"}
                    scrollButtons="auto"
                    aria-label="inventory tabs"
                >
                    <Tab icon={<InventoryIcon />} label="Parts" {...a11yProps(0)} />
                    <Tab icon={<PeopleIcon />} label="Suppliers" {...a11yProps(1)} />
                    <Tab icon={<ShoppingCartIcon />} label="Purchase Orders" {...a11yProps(2)} />
                </Tabs>

                <TabPanel value={currentTab} index={0}>
                    {renderPartViews()}
                </TabPanel>

                <TabPanel value={currentTab} index={1}>
                    {renderSupplierViews()}
                </TabPanel>

                <TabPanel value={currentTab} index={2}>
                    {renderPurchaseOrderViews()}
                </TabPanel>
            </Paper>
        </Box>
    );
};

export default Inventory;