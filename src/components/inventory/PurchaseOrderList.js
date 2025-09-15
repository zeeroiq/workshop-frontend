import React, { useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from '@mui/material';
import {
    Add,
    Visibility,
    CheckCircle,
    Cancel,
    LocalShipping,
    Inventory
} from '@mui/icons-material';

const PurchaseOrderList = ({ purchaseOrders, onView, onCreate, onUpdateStatus, loading, error }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    const statusColors = {
        PENDING: 'default',
        ORDERED: 'primary',
        PARTIALLY_RECEIVED: 'warning',
        COMPLETED: 'success',
        CANCELLED: 'error'
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setDetailDialogOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailDialogOpen(false);
        setSelectedOrder(null);
    };

    const handleReceiveOrder = async (orderId) => {
        try {
            await onUpdateStatus(orderId, 'COMPLETED');
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handleCancelOrder = async (orderId) => {
        try {
            await onUpdateStatus(orderId, 'CANCELLED');
        } catch (error) {
            console.error('Error cancelling order:', error);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography>Loading purchase orders...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                Error loading purchase orders: {error}
            </Alert>
        );
    }

    return (
        <>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" display="flex" alignItems="center">
                        <LocalShipping sx={{ mr: 1 }} />
                        Purchase Orders ({purchaseOrders.length})
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={onCreate}
                    >
                        New Order
                    </Button>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order #</TableCell>
                                <TableCell>Supplier</TableCell>
                                <TableCell>Order Date</TableCell>
                                <TableCell>Expected Delivery</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell>Total Amount</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {purchaseOrders
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((order) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell>
                                            <Typography fontWeight="bold">
                                                {order.orderNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {order.supplier?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {order.expectedDeliveryDate
                                                ? new Date(order.expectedDeliveryDate).toLocaleDateString()
                                                : 'Not set'
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {order.items?.length || 0} items
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight="medium">
                                                ${order.totalAmount?.toFixed(2) || '0.00'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={order.status}
                                                color={statusColors[order.status]}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" gap={1}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewDetails(order)}
                                                    color="primary"
                                                >
                                                    <Visibility />
                                                </IconButton>
                                                {order.status === 'ORDERED' && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleReceiveOrder(order.id)}
                                                        color="success"
                                                    >
                                                        <CheckCircle />
                                                    </IconButton>
                                                )}
                                                {order.status === 'PENDING' && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        color="error"
                                                    >
                                                        <Cancel />
                                                    </IconButton>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={purchaseOrders.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />

                {purchaseOrders.length === 0 && (
                    <Box textAlign="center" py={4}>
                        <Inventory sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Purchase Orders
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            Create your first purchase order to manage inventory restocking.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={onCreate}
                            sx={{ mt: 2 }}
                        >
                            Create Purchase Order
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* Order Details Dialog */}
            <Dialog
                open={detailDialogOpen}
                onClose={handleCloseDetails}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Purchase Order Details: {selectedOrder?.orderNumber}
                </DialogTitle>
                <DialogContent>
                    {selectedOrder && (
                        <Box>
                            <Box mb={3}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Supplier: {selectedOrder.supplier?.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Order Date: {new Date(selectedOrder.orderDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Expected Delivery: {selectedOrder.expectedDeliveryDate
                                    ? new Date(selectedOrder.expectedDeliveryDate).toLocaleDateString()
                                    : 'Not specified'
                                }
                                </Typography>
                                <Chip
                                    label={selectedOrder.status}
                                    color={statusColors[selectedOrder.status]}
                                    sx={{ mt: 1 }}
                                />
                            </Box>

                            <Typography variant="h6" gutterBottom>
                                Order Items
                            </Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Part</TableCell>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>Unit Price</TableCell>
                                            <TableCell>Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedOrder.items?.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {item.partName || `Part #${item.partId}`}
                                                    {item.partNumber && (
                                                        <Typography variant="caption" display="block" color="text.secondary">
                                                            {item.partNumber}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>${item.unitPrice?.toFixed(2)}</TableCell>
                                                <TableCell>${item.totalPrice?.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box mt={2} textAlign="right">
                                <Typography variant="h6">
                                    Total: ${selectedOrder.totalAmount?.toFixed(2)}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetails}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PurchaseOrderList;