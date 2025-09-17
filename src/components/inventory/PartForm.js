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
    FormHelperText
} from '@mui/material';

const PART_CATEGORIES = [
    'BRAKES',
    'ENGINE',
    'FILTERS',
    'FLUIDS',
    'ELECTRICAL',
    'SUSPENSION',
    'EXHAUST',
    'BODY',
    'INTERIOR',
    'OTHER'
];

const PART_STATUS = {
    ACTIVE: 'ACTIVE',
    LOW_STOCK: 'LOW_STOCK',
    DISCONTINUED: 'DISCONTINUED'
};

const UNIT_TYPES = [
    'PIECE',
    'SET',
    'PAIR',
    'BOTTLE',
    'BOX',
    'ROLL',
    'METER'
];

const PartForm = ({ part, onSave, onCancel }) => {
    const isEdit = Boolean(part && part.id);

    const [formData, setFormData] = useState({
        sku: part?.sku || '',
        name: part?.name || '',
        description: part?.description || '',
        category: part?.category || '',
        unitType: part?.unitType || 'PIECE',
        unitPrice: part?.unitPrice || '',
        quantity: part?.quantity || '',
        minQuantity: part?.minQuantity || '',
        maxQuantity: part?.maxQuantity || '',
        status: part?.status || PART_STATUS.ACTIVE,
        weight: part?.weight || '',
        dimensions: part?.dimensions || '',
        manufacturer: part?.manufacturer || '',
        supplierPartNumber: part?.supplierPartNumber || ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.unitType) newErrors.unitType = 'Unit type is required';
        if (!formData.unitPrice || formData.unitPrice <= 0) newErrors.unitPrice = 'Valid unit price is required';
        if (!formData.quantity || formData.quantity < 0) newErrors.quantity = 'Valid quantity is required';
        if (formData.minQuantity && formData.minQuantity < 0) newErrors.minQuantity = 'Minimum quantity must be positive';
        if (formData.maxQuantity && formData.maxQuantity < 0) newErrors.maxQuantity = 'Maximum quantity must be positive';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // In a real app, this would save to the backend
        onSave(formData);
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                {isEdit ? 'Edit Part' : 'Create New Part'}
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="SKU *"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            error={Boolean(errors.sku)}
                            helperText={errors.sku}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Name *"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={Boolean(errors.name)}
                            helperText={errors.name}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={Boolean(errors.category)}>
                            <InputLabel>Category *</InputLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                label="Category *"
                            >
                                {PART_CATEGORIES.map(category => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={Boolean(errors.unitType)}>
                            <InputLabel>Unit Type *</InputLabel>
                            <Select
                                name="unitType"
                                value={formData.unitType}
                                onChange={handleChange}
                                label="Unit Type *"
                            >
                                {UNIT_TYPES.map(unit => (
                                    <MenuItem key={unit} value={unit}>
                                        {unit}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.unitType && <FormHelperText>{errors.unitType}</FormHelperText>}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Unit Price *"
                            name="unitPrice"
                            value={formData.unitPrice}
                            onChange={handleChange}
                            error={Boolean(errors.unitPrice)}
                            helperText={errors.unitPrice}
                            inputProps={{ step: "0.01", min: "0" }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Quantity *"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            error={Boolean(errors.quantity)}
                            helperText={errors.quantity}
                            inputProps={{ min: "0" }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                label="Status"
                            >
                                {Object.entries(PART_STATUS).map(([key, value]) => (
                                    <MenuItem key={key} value={value}>
                                        {value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Minimum Quantity"
                            name="minQuantity"
                            value={formData.minQuantity}
                            onChange={handleChange}
                            error={Boolean(errors.minQuantity)}
                            helperText={errors.minQuantity}
                            inputProps={{ min: "0" }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Maximum Quantity"
                            name="maxQuantity"
                            value={formData.maxQuantity}
                            onChange={handleChange}
                            error={Boolean(errors.maxQuantity)}
                            helperText={errors.maxQuantity}
                            inputProps={{ min: "0" }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Weight (kg)"
                            name="weight"
                            type="number"
                            value={formData.weight}
                            onChange={handleChange}
                            inputProps={{ step: "0.01", min: "0" }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Dimensions (LxWxH)"
                            name="dimensions"
                            value={formData.dimensions}
                            onChange={handleChange}
                            placeholder="e.g., 10x5x2"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Manufacturer"
                            name="manufacturer"
                            value={formData.manufacturer}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Supplier Part Number"
                            name="supplierPartNumber"
                            value={formData.supplierPartNumber}
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
                        {isEdit ? 'Update Part' : 'Create Part'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default PartForm;