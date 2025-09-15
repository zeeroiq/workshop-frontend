import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';

const InventoryForm = ({ open, item, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        partNumber: '',
        name: '',
        description: '',
        category: '',
        quantity: 0,
        minStockLevel: 5,
        cost: 0,
        price: 0,
        supplier: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (item) {
            setFormData(item);
        } else {
            setFormData({
                partNumber: '',
                name: '',
                description: '',
                category: '',
                quantity: 0,
                minStockLevel: 5,
                cost: 0,
                price: 0,
                supplier: ''
            });
        }
        setErrors({});
    }, [item, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.partNumber.trim()) newErrors.partNumber = 'Part number is required';
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.category.trim()) newErrors.category = 'Category is required';
        if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
        if (formData.cost < 0) newErrors.cost = 'Cost cannot be negative';
        if (formData.price < 0) newErrors.price = 'Price cannot be negative';
        if (formData.minStockLevel < 0) newErrors.minStockLevel = 'Minimum stock level cannot be negative';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const categories = [
        'Engine Parts',
        'Braking System',
        'Suspension',
        'Electrical',
        'Filters',
        'Fluids',
        'Tools',
        'Accessories',
        'Other'
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
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
                        <FormControl fullWidth required error={!!errors.category}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                label="Category"
                                onChange={handleChange}
                            >
                                {categories.map(category => (
                                    <MenuItem key={category} value={category}>
                                        {category}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.category && <span style={{ color: '#d32f2f', fontSize: '0.75rem' }}>{errors.category}</span>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                            required
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
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Quantity"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            error={!!errors.quantity}
                            helperText={errors.quantity}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Minimum Stock Level"
                            name="minStockLevel"
                            value={formData.minStockLevel}
                            onChange={handleChange}
                            error={!!errors.minStockLevel}
                            helperText={errors.minStockLevel}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            label="Supplier"
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Cost"
                            name="cost"
                            value={formData.cost}
                            onChange={handleChange}
                            error={!!errors.cost}
                            helperText={errors.cost}
                            InputProps={{
                                startAdornment: '$',
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            error={!!errors.price}
                            helperText={errors.price}
                            InputProps={{
                                startAdornment: '$',
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {item ? 'Update Item' : 'Add Item'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InventoryForm;