import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Chip,
    Button,
    Grid,
    Divider
} from '@mui/material';
import {
    Edit as EditIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';

const PartDetails = ({ part, onBack, onEdit }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'success';
            case 'LOW_STOCK':
                return 'warning';
            case 'DISCONTINUED':
                return 'error';
            default:
                return 'default';
        }
    };

    const getQuantityStatus = () => {
        if (part.quantity === 0) return 'error';
        if (part.minQuantity && part.quantity <= part.minQuantity) return 'warning';
        if (part.maxQuantity && part.quantity >= part.maxQuantity) return 'info';
        return 'success';
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
                    Edit Part
                </Button>
            </Box>

            <Typography variant="h4" component="h1" gutterBottom>
                {part.name}
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Basic Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    SKU
                                </Typography>
                                <Typography variant="body1">{part.sku}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Status
                                </Typography>
                                <Chip
                                    label={part.status}
                                    color={getStatusColor(part.status)}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Category
                                </Typography>
                                <Typography variant="body1">{part.category}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Unit Type
                                </Typography>
                                <Typography variant="body1">{part.unitType}</Typography>
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Pricing & Inventory
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Unit Price
                                </Typography>
                                <Typography variant="body1">
                                    ${part.unitPrice?.toFixed(2)}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Current Quantity
                                </Typography>
                                <Chip
                                    label={`${part.quantity} ${part.unitType}`}
                                    color={getQuantityStatus()}
                                    variant="outlined"
                                />
                            </Grid>
                            {part.minQuantity && (
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Minimum Quantity
                                    </Typography>
                                    <Typography variant="body1">
                                        {part.minQuantity} {part.unitType}
                                    </Typography>
                                </Grid>
                            )}
                            {part.maxQuantity && (
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Maximum Quantity
                                    </Typography>
                                    <Typography variant="body1">
                                        {part.maxQuantity} {part.unitType}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Additional Information
                        </Typography>
                        <Grid container spacing={2}>
                            {part.manufacturer && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Manufacturer
                                    </Typography>
                                    <Typography variant="body1">{part.manufacturer}</Typography>
                                </Grid>
                            )}
                            {part.supplierPartNumber && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Supplier Part Number
                                    </Typography>
                                    <Typography variant="body1">{part.supplierPartNumber}</Typography>
                                </Grid>
                            )}
                            {part.weight && (
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Weight
                                    </Typography>
                                    <Typography variant="body1">{part.weight} kg</Typography>
                                </Grid>
                            )}
                            {part.dimensions && (
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Dimensions
                                    </Typography>
                                    <Typography variant="body1">{part.dimensions}</Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Box>

                    {part.description && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Description
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                {part.description}
                            </Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>

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
                            {new Date(part.createdAt).toLocaleDateString()}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Last Updated
                        </Typography>
                        <Typography variant="body2">
                            {new Date(part.updatedAt).toLocaleDateString()}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default PartDetails;