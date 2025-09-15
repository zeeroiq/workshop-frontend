import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Grid,
    Paper,
    Typography,
    Alert
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';

const PartForm = ({ part, onSubmit, onCancel, suppliers }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        partNumber: '',
        category: '',
        manufacturer: '',
        costPrice: '',
        sellingPrice: '',
        quantityInStock: '',
        minStockLevel: '5',
        location: '',
        supplierId: ''
    });

    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (part) {
            setFormData({
                name: part.name || '',
                description: part.description || '',
                partNumber: part.partNumber || '',
                category: part.category || '',
                manufacturer: part.manufacturer || '',
                costPrice: part.costPrice || '',
                sellingPrice: part.sellingPrice || '',
                quantityInStock: part.quantityInStock || '',
                minStockLevel: part.minStockLevel || '5',
                location: part.location || '',
                supplierId: part.supplier?.id || ''
            });
        }
    }, [part]);

    const categories = [
        'Engine Parts',
        'Brake System',
        'Filters',
        'Electrical',
        'Fluids',
        'Suspension',
        'Transmission',
        'Exhaust System',
        'Cooling System',
        'Interior Parts'
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Part name is required';
        if (!formData.partNumber.trim()) newErrors.partNumber = 'Part number is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.costPrice || formData.costPrice <= 0) newErrors.costPrice = 'Valid cost price is required';
        if (!formData.sellingPrice || formData.sellingPrice <= 0) newErrors.sellingPrice = 'Valid selling price is required';
        if (formData.quantityInStock < 0) newErrors.quantityInStock = 'Stock cannot be negative';
        if (formData.minStockLevel < 0) newErrors.minStockLevel = 'Minimum stock level cannot be negative';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await onSubmit(formData);
            setSuccessMessage(`Part ${part ? 'updated' : 'added'} successfully!`);
            setTimeout(() => setSuccessMessage(''), 3000);

            if (!part) {
                // Reset form if it's a new part
                setFormData({
                    name: '',
                    description: '',
                    partNumber: '',
                    category: '',
                    manufacturer: '',
                    costPrice: '',
                    sellingPrice: '',
                    quantityInStock: '',
                    minStockLevel: '5',
                    location: '',
                    supplierId: ''
                });
            }
        } catch (error) {
            console.error('Error saving part:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
                {part ? 'Edit Part' : 'Add New Part'}
            </Typography>

            {successMessage && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {successMessage}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Part Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Part Number"
                            name="partNumber"
                            value={formData.partNumber}
                            onChange={handleChange}
                            error={!!errors.partNumber}
                            helperText={errors.partNumber}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            error={!!errors.category}
                            helperText={errors.category}
                            required
                        >
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </TextField>
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
                            label="Cost Price ($)"
                            name="costPrice"
                            type="number"
                            value={formData.costPrice}
                            onChange={handleChange}
                            error={!!errors.costPrice}
                            helperText={errors.costPrice}
                            inputProps={{ step: "0.01", min: "0" }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Selling Price ($)"
                            name="sellingPrice"
                            type="number"
                            value={formData.sellingPrice}
                            onChange={handleChange}
                            error={!!errors.sellingPrice}
                            helperText={errors.sellingPrice}
                            inputProps={{ step: "0.01", min: "0" }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Current Stock"
                            name="quantityInStock"
                            type="number"
                            value={formData.quantityInStock}
                            onChange={handleChange}
                            error={!!errors.quantityInStock}
                            helperText={errors.quantityInStock}
                            inputProps={{ min: "0" }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Minimum Stock Level"
                            name="minStockLevel"
                            type="number"
                            value={formData.minStockLevel}
                            onChange={handleChange}
                            error={!!errors.minStockLevel}
                            helperText={errors.minStockLevel}
                            inputProps={{ min: "0" }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Location (Shelf/Bin)"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., A1-05"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            label="Supplier"
                            name="supplierId"
                            value={formData.supplierId}
                            onChange={handleChange}
                        >
                            <MenuItem value="">Select Supplier</MenuItem>
                            {suppliers.map((supplier) => (
                                <MenuItem key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </MenuItem>
                            ))}
                        </TextField>
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

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                startIcon={<Cancel />}
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<Save />}
                            >
                                {part ? 'Update Part' : 'Add Part'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default PartForm;