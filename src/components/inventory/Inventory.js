import React, { useState, useEffect } from 'react';
import {
    Container,
    Tabs,
    Tab,
    Box
} from '@mui/material';
import PartForm from './PartForm';
import PartList from './PartList';
import PurchaseOrderList from './PurchaseOrderList';
import SupplierList from './SupplierList';

const Inventory = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [parts, setParts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [selectedPart, setSelectedPart] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch data from your API
        fetchInventoryData();
    }, []);

    const fetchInventoryData = async () => {
        try {
            setLoading(true);
            // Replace with actual API calls
            const partsResponse = await fetch('/api/parts');
            const suppliersResponse = await fetch('/api/suppliers');
            const ordersResponse = await fetch('/api/purchase-orders');

            const partsData = await partsResponse.json();
            const suppliersData = await suppliersResponse.json();
            const ordersData = await ordersResponse.json();

            setParts(partsData);
            setSuppliers(suppliersData);
            setPurchaseOrders(ordersData);
        } catch (error) {
            console.error('Error fetching inventory data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePart = async (partData) => {
        try {
            const url = selectedPart ? `/api/parts/${selectedPart.id}` : '/api/parts';
            const method = selectedPart ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(partData),
            });

            if (response.ok) {
                await fetchInventoryData(); // Refresh data
                setSelectedPart(null); // Reset form
            }
        } catch (error) {
            console.error('Error saving part:', error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label="Parts Inventory" />
                <Tab label="Purchase Orders" />
                <Tab label="Suppliers" />
            </Tabs>

            {activeTab === 0 && (
                <Box>
                    <PartForm
                        part={selectedPart}
                        onSubmit={handleSavePart}
                        onCancel={() => setSelectedPart(null)}
                        suppliers={suppliers}
                    />
                    <PartList
                        parts={parts}
                        onEdit={setSelectedPart}
                        onDelete={async (id) => {
                            await fetch(`/api/parts/${id}`, { method: 'DELETE' });
                            fetchInventoryData();
                        }}
                        onAdd={() => setSelectedPart(null)}
                        loading={loading}
                    />
                </Box>
            )}

            {activeTab === 1 && (
                <PurchaseOrderList
                    purchaseOrders={purchaseOrders}
                    onView={(order) => console.log('View order:', order)}
                    onCreate={() => console.log('Create new order')}
                    onUpdateStatus={async (id, status) => {
                        await fetch(`/api/purchase-orders/${id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status })
                        });
                        fetchInventoryData();
                    }}
                    loading={loading}
                />
            )}

            {activeTab === 2 && (
                <SupplierList
                    suppliers={suppliers}
                    onEdit={(supplier) => console.log('Edit supplier:', supplier)}
                    onDelete={async (id) => {
                        await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
                        fetchInventoryData();
                    }}
                    onCreate={() => console.log('Create new supplier')}
                    loading={loading}
                />
            )}
        </Container>
    );
};

export default Inventory;