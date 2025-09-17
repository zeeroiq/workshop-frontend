import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Chip,
    Button,
    Grid,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Edit as EditIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';

const PurchaseOrderDetails = ({ order, onBack, onEdit }) => {
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

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<BackIcon />}
                    onClick={onBack}
                    sx={{ mr: 2 }}
                >
                    Back to List
                </Button>
                <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={onEdit}
                >
                    Edit Order
                </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {order.poNumber}
                    </Typography>
                    <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="medium"
                    />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" component="p">
                        ${order.totalAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Total Amount
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Supplier
                                </Typography>
                                <Typography variant="body1">{order.supplier.name}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Order Date
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Expected Date
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(order.expectedDate).toLocaleDateString()}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    {order.notes && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Notes
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                {order.notes}
                            </Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Order Items
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Part</TableCell>
                                <TableCell>SKU</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Unit Price</TableCell>
                                <TableCell>Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {order.items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.part.name}</TableCell>
                                    <TableCell>{item.part.sku}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                                    <TableCell>${item.total.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
                <Typography variant="h6" gutterBottom>
                    System Information
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Created
                        </Typography>
                        <Typography variant="body2">
                            {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Last Updated
                        </Typography>
                        <Typography variant="body2">
                            {new Date(order.updatedAt).toLocaleDateString()}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default PurchaseOrderDetails;