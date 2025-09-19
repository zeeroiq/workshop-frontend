import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Chip,
    TextField,
    Box,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Add as AddIcon,
    Search as SearchIcon
} from '@mui/icons-material';

// Mock data
const mockPurchaseOrders = [
    {
        id: 1,
        poNumber: 'PO-2023-001',
        supplier: { id: 1, name: 'Auto Parts Central' },
        orderDate: '2023-10-15',
        expectedDate: '2023-10-22',
        status: 'RECEIVED',
        totalAmount: 1245.75,
        items: [
            { part: { sku: 'BRK-001', name: 'Brake Pad Set' }, quantity: 10, unitPrice: 89.99, total: 899.90 },
            { part: { sku: 'BRK-002', name: 'Brake Rotor' }, quantity: 4, unitPrice: 86.46, total: 345.85 }
        ],
        notes: 'Urgent order for customer appointments',
        createdAt: '2023-10-15',
        updatedAt: '2023-10-20'
    },
    {
        id: 2,
        poNumber: 'PO-2023-002',
        supplier: { id: 2, name: 'Engine Components Inc' },
        orderDate: '2023-10-18',
        expectedDate: '2023-10-25',
        status: 'ORDERED',
        totalAmount: 567.89,
        items: [
            { part: { sku: 'OIL-002', name: 'Synthetic Engine Oil 5W-30' }, quantity: 12, unitPrice: 34.99, total: 419.88 },
            { part: { sku: 'FLT-003', name: 'Oil Filter' }, quantity: 12, unitPrice: 12.99, total: 155.88 }
        ],
        notes: 'Regular monthly order',
        createdAt: '2023-10-18',
        updatedAt: '2023-10-18'
    }
];

const PurchaseOrderList = ({ onViewDetails, onEdit, onCreate }) => {
    const [purchaseOrders, setPurchaseOrders] = useState(mockPurchaseOrders);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleDeleteClick = (order) => {
        setOrderToDelete(order);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        setPurchaseOrders(purchaseOrders.filter(order => order.id !== orderToDelete.id));
        setDeleteDialogOpen(false);
        setOrderToDelete(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DRAFT':
                return 'default';
            case 'ORDERED':
                return 'primary';
            case 'SHIPPED':
                return 'info';
            case 'RECEIVED':
                return 'success';
            case 'CANCELLED':
                return 'error';
            default:
                return 'default';
        }
    };

    const filteredOrders = purchaseOrders.filter(order =>
        order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="h2">
                    Purchase Orders
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onCreate}
                >
                    Create PO
                </Button>
            </Box>

            <Box sx={{ display: 'flex', mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Search purchase orders by number, supplier, or status..."
                    value={searchTerm}
                    onChange={handleSearch}
                    InputProps={{
                        endAdornment: <SearchIcon />
                    }}
                />
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>PO Number</TableCell>
                            <TableCell>Supplier</TableCell>
                            <TableCell>Order Date</TableCell>
                            <TableCell>Expected Date</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{order.poNumber}</TableCell>
                                <TableCell>{order.supplier.name}</TableCell>
                                <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(order.expectedDate).toLocaleDateString()}</TableCell>
                                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={order.status}
                                        color={getStatusColor(order.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => onViewDetails(order)}
                                        title="View Details"
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => onEdit(order)}
                                        title="Edit"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDeleteClick(order)}
                                        title="Delete"
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete purchase order "{orderToDelete?.poNumber}"?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default PurchaseOrderList;