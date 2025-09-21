import React, { useState, useEffect } from 'react';
import {
    FaArrowLeft,
    FaSave,
    FaTimes,
    FaBox,
    FaTag,
    FaIndustry,
    FaMapMarkerAlt,
    FaUserTie,
    FaFileAlt,
    FaRupeeSign
} from 'react-icons/fa';
import { inventoryService } from '../../../services/inventoryService';

import '../../../styles/workshop.css';
import '../../../styles/inventory/part/PartForm.css';

const PartForm = ({ part, onSave, onCancel }) => {
    const isEdit = Boolean(part && part.id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        partNumber: '',
        category: '',
        manufacturer: '',
        costPrice: '',
        sellingPrice: '',
        quantityInStock: '',
        minStockLevel: '',
        location: '',
        supplierId: ''
    });

    const [errors, setErrors] = useState({});
    const [suppliers, setSuppliers] = useState([]);
    const [categories, setCategories] = useState([]);

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
                minStockLevel: part.minStockLevel || '',
                location: part.location || '',
                supplierId: part.supplierId || ''
            });
        }

        // Load suppliers and categories (in a real app, these would come from APIs)
        loadSuppliers();
        loadCategories();
    }, [part]);

    const loadSuppliers = async () => {
        try {
            const response = await inventoryService.getSuppliers();
            if (response.data.success) {
                setSuppliers(response.data.data.content || response.data.data);
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
        }
    };

    const loadCategories = () => {
        // Mock categories - in a real app, these would come from an API
        const mockCategories = [
            'Fluids',
            'Filters',
            'Brakes',
            'Ignition',
            'Electrical',
            'Engine',
            'Transmission',
            'Suspension',
            'Exhaust',
            'Body',
            'Interior'
        ];
        setCategories(mockCategories);
    };

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

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.partNumber.trim()) newErrors.partNumber = 'Part number is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
        if (!formData.costPrice || formData.costPrice <= 0) newErrors.costPrice = 'Valid cost price is required';
        if (!formData.sellingPrice || formData.sellingPrice <= 0) newErrors.sellingPrice = 'Valid selling price is required';
        if (!formData.quantityInStock || formData.quantityInStock < 0) newErrors.quantityInStock = 'Valid quantity is required';
        if (!formData.minStockLevel || formData.minStockLevel < 0) newErrors.minStockLevel = 'Valid minimum stock level is required';
        if (!formData.supplierId) newErrors.supplierId = 'Supplier is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const partData = {
                ...formData,
                costPrice: parseFloat(formData.costPrice),
                sellingPrice: parseFloat(formData.sellingPrice),
                quantityInStock: parseInt(formData.quantityInStock),
                minStockLevel: parseInt(formData.minStockLevel),
                supplierId: parseInt(formData.supplierId)
            };

            if (isEdit) {
                await inventoryService.updatePart(part.id, partData);
            } else {
                await inventoryService.createPart(partData);
            }

            onSave();
        } catch (error) {
            console.error('Error saving part:', error);
        }
    };

    return (
        <div className="part-form-container">
            <div className="part-form-header">
                <button className="back-button" onClick={onCancel}>
                    <FaArrowLeft /> Back to Parts
                </button>
                <h2>{isEdit ? 'Edit Part' : 'Create New Part'}</h2>
            </div>

            <form className="part-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Basic Information</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaBox className="input-icon" /> Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label>
                                <FaTag className="input-icon" /> Part Number *
                            </label>
                            <input
                                type="text"
                                name="partNumber"
                                value={formData.partNumber}
                                onChange={handleChange}
                                className={errors.partNumber ? 'error' : ''}
                            />
                            {errors.partNumber && <span className="error-text">{errors.partNumber}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className={errors.category ? 'error' : ''}
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <span className="error-text">{errors.category}</span>}
                        </div>
                        <div className="form-group">
                            <label>
                                <FaIndustry className="input-icon" /> Manufacturer *
                            </label>
                            <input
                                type="text"
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                className={errors.manufacturer ? 'error' : ''}
                            />
                            {errors.manufacturer && <span className="error-text">{errors.manufacturer}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>
                            <FaFileAlt className="input-icon" /> Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Part description"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Pricing & Inventory</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaRupeeSign className="input-icon" /> Cost Price *
                            </label>
                            <input
                                type="number"
                                name="costPrice"
                                value={formData.costPrice}
                                onChange={handleChange}
                                className={errors.costPrice ? 'error' : ''}
                                step="0.01"
                                min="0"
                            />
                            {errors.costPrice && <span className="error-text">{errors.costPrice}</span>}
                        </div>
                        <div className="form-group">
                            <label>
                                <FaRupeeSign className="input-icon" /> Selling Price *
                            </label>
                            <input
                                type="number"
                                name="sellingPrice"
                                value={formData.sellingPrice}
                                onChange={handleChange}
                                className={errors.sellingPrice ? 'error' : ''}
                                step="0.01"
                                min="0"
                            />
                            {errors.sellingPrice && <span className="error-text">{errors.sellingPrice}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Current Stock *</label>
                            <input
                                type="number"
                                name="quantityInStock"
                                value={formData.quantityInStock}
                                onChange={handleChange}
                                className={errors.quantityInStock ? 'error' : ''}
                                min="0"
                            />
                            {errors.quantityInStock && <span className="error-text">{errors.quantityInStock}</span>}
                        </div>
                        <div className="form-group">
                            <label>Minimum Stock Level *</label>
                            <input
                                type="number"
                                name="minStockLevel"
                                value={formData.minStockLevel}
                                onChange={handleChange}
                                className={errors.minStockLevel ? 'error' : ''}
                                min="0"
                            />
                            {errors.minStockLevel && <span className="error-text">{errors.minStockLevel}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Location & Supplier</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <FaMapMarkerAlt className="input-icon" /> Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g., A1-01"
                            />
                        </div>
                        <div className="form-group">
                            <label>
                                <FaUserTie className="input-icon" /> Supplier *
                            </label>
                            <select
                                name="supplierId"
                                value={formData.supplierId}
                                onChange={handleChange}
                                className={errors.supplierId ? 'error' : ''}
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map(supplier => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </select>
                            {errors.supplierId && <span className="error-text">{errors.supplierId}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onCancel}>
                        <FaTimes /> Cancel
                    </button>
                    <button type="submit" className="save-btn">
                        <FaSave /> {isEdit ? 'Update Part' : 'Create Part'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PartForm;