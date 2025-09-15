import React from 'react';
import { Paper, Typography, Box, LinearProgress } from '@mui/material';
import { TrendingUp, TrendingDown, Inventory } from '@mui/icons-material';

const InventoryStats = ({ inventory }) => {
    const totalItems = inventory.length;
    const outOfStock = inventory.filter(item => item.quantity === 0).length;
    const lowStock = inventory.filter(item => item.quantity > 0 && item.quantity <= item.minStockLevel).length;
    const inStock = inventory.filter(item => item.quantity > item.minStockLevel).length;

    const lowStockPercentage = totalItems > 0 ? (lowStock / totalItems) * 100 : 0;
    const outOfStockPercentage = totalItems > 0 ? (outOfStock / totalItems) * 100 : 0;
    const inStockPercentage = totalItems > 0 ? (inStock / totalItems) * 100 : 0;

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
                Inventory Status
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">In Stock</Typography>
                    <Typography variant="body2">{inStock} ({inStockPercentage.toFixed(1)}%)</Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={inStockPercentage}
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                />
            </Box>

            <Box sx={{ mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">Low Stock</Typography>
                    <Typography variant="body2">{lowStock} ({lowStockPercentage.toFixed(1)}%)</Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={lowStockPercentage}
                    color="warning"
                    sx={{ height: 8, borderRadius: 4 }}
                />
            </Box>

            <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2">Out of Stock</Typography>
                    <Typography variant="body2">{outOfStock} ({outOfStockPercentage.toFixed(1)}%)</Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={outOfStockPercentage}
                    color="error"
                    sx={{ height: 8, borderRadius: 4 }}
                />
            </Box>

            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" align="center">
                    <Inventory sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
                    Total Items: {totalItems}
                </Typography>
            </Box>
        </Paper>
    );
};

export default InventoryStats;