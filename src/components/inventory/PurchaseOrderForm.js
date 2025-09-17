import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Typography,
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

// Mock data
const mockSuppliers = [
    { id: 1, name: 'Auto Parts Central' },
    { id: 2, name: 'Engine Components Inc' }
];

const mockParts = [
    { id: 1, sku: 'BRK-001', name: 'Brake Pad Set', unitPrice: 89.99 },
    { id: 2, sku: 'OIL-002', name: 'Synthetic Engine Oil 5W-30', unitPrice: 34.99 },
    { id: 3, sku: 'FLT-003', name: 'Oil Filter', unitPrice: 12.99 }
];

const ORDER_STATUS = [
    'DRAFT',
    'ORDERED',
    'SHIPPED',
    'RECEIVED',
    'CANCELLED'
];

const PurchaseOrderForm = ({ order, onSave, onCancel }) => {
    const isEdit = Boolean(order && order.id);

    const [formData, setFormData] = useState({
        supplier: order?.supplier?.id || '',
        orderDate: order?.orderDate || new Date().toISOString().split('T')[0],
        expectedDate: order?.expectedDate || '',
        status: order?.status || 'DRAFT',
        notes: order?.notes || '',
        items: order?.items || []
    });

    const [newItem, setNewItem] = useState({
        part: '',
        quantity: 1
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleItemChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddItem = () => {
        if (!newItem.part || newItem.quantity < 1) return;

        const part = mockParts.find(p => p.id === parseInt(newItem.part));
        const itemTotal = part.unitPrice * newItem.quantity;

        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    part,
                    quantity: newItem.quantity,
                    unitPrice: part.unitPrice,
                    total: itemTotal
                }
            ]
        }));

        setNewItem({
            part: '',
            quantity: 1
        });
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const orderData = {
            ...formData,
            totalAmount: calculateTotal(),
            supplier: mockSuppliers.find(s => s.id === parseInt(formData.supplier))
        };

        // In a real app, this would save to the backend
        onSave(orderData);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                {isEdit ? 'Edit Purchase Order' : 'Create Purchase Order'}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Supplier *</InputLabel>
                            <Select
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                label="Supplier *"
                                required
                            >
                                {mockSuppliers.map(supplier => (
                                    <MenuItem key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                label="Status"
                            >
                                {ORDER_STATUS.map(status => (
                                    <MenuItem key={status} value={status}>
                                        {status}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Order Date *"
                            name="orderDate"
                            type="date"
                            value={formData.orderDate}
                            onChange={handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Expected Delivery Date"
                            name="expectedDate"
                            type="date"
                            value={formData.expectedDate}
                            onChange={handleChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Order Items
                        </Typography>

                        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Grid item xs={5}>
                                <FormControl fullWidth>
                                    <InputLabel>Part</InputLabel>
                                    <Select
                                        name="part"
                                        value={newItem.part}
                                        onChange={handleItemChange}
                                        label="Part"
                                    >
                                        {mockParts.map(part => (
                                            <MenuItem key={part.id} value={part.id}>
                                                {part.name} ({part.sku})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Quantity"
                                    name="quantity"
                                    type="number"
                                    value={newItem.quantity}
                                    onChange={handleItemChange}
                                    inputProps={{ min: 1 }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddItem}
                                    disabled={!newItem.part}
                                >
                                    Add Item
                                </Button>
                            </Grid>
                        </Grid>

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Part</TableCell>
                                        <TableCell>Quantity</TableCell>
                                        <TableCell>Unit Price</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {formData.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.part.name} ({item.part.sku})</TableCell>
                                            <TableCell>{item.quantity}</TableCell>
                                            <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                            <TableCell>${item.total.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveItem(index)}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {formData.items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                No items added yet
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {formData.items.length > 0 && (
                            <Box sx={{ mt: 2, textAlign: 'right' }}>
                                <Typography variant="h6">
                                    Total: ${calculateTotal().toFixed(2)}
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Notes"
                            name="notes"
                            multiline
                            rows={4}
                            value={formData.notes}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                    >
                        {isEdit ? 'Update Order' : 'Create Order'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default PurchaseOrderForm;