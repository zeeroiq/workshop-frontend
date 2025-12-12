import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { inventoryService } from '@/services/inventoryService';
import { toast } from 'react-toastify';

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
    const [loading, setLoading] = useState(false);

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
        loadInitialData();
    }, [part]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [suppliersRes, categoriesRes] = await Promise.all([
                inventoryService.getSuppliers(),
                // Mock categories for now
                Promise.resolve(['Fluids', 'Filters', 'Brakes', 'Ignition', 'Electrical', 'Engine', 'Transmission', 'Suspension', 'Exhaust', 'Body', 'Interior'])
            ]);

            if (suppliersRes.data.success) {
                setSuppliers(suppliersRes.data.data.content || suppliersRes.data.data);
            }
            setCategories(categoriesRes);
        } catch (error) {
            console.error('Error loading initial data:', error);
            toast.error('Failed to load necessary data.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.partNumber.trim()) newErrors.partNumber = 'Part number is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Manufacturer is required';
        if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) newErrors.costPrice = 'Valid cost price is required';
        if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) newErrors.sellingPrice = 'Valid selling price is required';
        if (formData.quantityInStock === '' || parseInt(formData.quantityInStock) < 0) newErrors.quantityInStock = 'Valid quantity is required';
        if (formData.minStockLevel === '' || parseInt(formData.minStockLevel) < 0) newErrors.minStockLevel = 'Valid minimum stock is required';
        if (!formData.supplierId) newErrors.supplierId = 'Supplier is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
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
                toast.success('Part updated successfully!');
            } else {
                await inventoryService.createPart(partData);
                toast.success('Part created successfully!');
            }
            onSave();
        } catch (error) {
            console.error('Error saving part:', error);
            toast.error('Failed to save part.');
        } finally {
            setLoading(false);
        }
    };

    const Input = ({ name, label, value, onChange, error, type = "text", children, ...props }) => (
        <div className="flex flex-col">
            <label htmlFor={name} className="mb-1 text-sm font-medium text-muted-foreground">{label}</label>
            {children ? (
                React.cloneElement(children, {
                    id: name,
                    name,
                    value,
                    onChange,
                    className: `bg-input border ${error ? 'border-red-500' : 'border-border'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary`,
                    ...props
                })
            ) : (
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={`bg-input border ${error ? 'border-red-500' : 'border-border'} rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                    {...props}
                />
            )}
            {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
        </div>
    );

    return (
        <div className="bg-card p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <button className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary" onClick={onCancel}>
                    <FaArrowLeft className="mr-2" /> Back to Parts
                </button>
                <h2 className="text-xl font-semibold">{isEdit ? 'Edit Part' : 'Create New Part'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="p-5 border border-border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input name="name" label="Name *" value={formData.name} onChange={handleChange} error={errors.name} />
                        <Input name="partNumber" label="Part Number *" value={formData.partNumber} onChange={handleChange} error={errors.partNumber} />
                        <Input name="category" label="Category *" value={formData.category} onChange={handleChange} error={errors.category}>
                            <select>
                                <option value="">Select Category</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </Input>
                        <Input name="manufacturer" label="Manufacturer *" value={formData.manufacturer} onChange={handleChange} error={errors.manufacturer} />
                        <div className="md:col-span-2">
                            <Input name="description" label="Description" value={formData.description} onChange={handleChange} error={errors.description}>
                                <textarea rows={3} />
                            </Input>
                        </div>
                    </div>
                </div>

                {/* Pricing & Inventory */}
                <div className="p-5 border border-border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Pricing & Inventory</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input name="costPrice" label="Cost Price *" type="number" value={formData.costPrice} onChange={handleChange} error={errors.costPrice} step="0.01" min="0" />
                        <Input name="sellingPrice" label="Selling Price *" type="number" value={formData.sellingPrice} onChange={handleChange} error={errors.sellingPrice} step="0.01" min="0" />
                        <Input name="quantityInStock" label="Current Stock *" type="number" value={formData.quantityInStock} onChange={handleChange} error={errors.quantityInStock} min="0" />
                        <Input name="minStockLevel" label="Minimum Stock Level *" type="number" value={formData.minStockLevel} onChange={handleChange} error={errors.minStockLevel} min="0" />
                    </div>
                </div>

                {/* Location & Supplier */}
                <div className="p-5 border border-border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Location & Supplier</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input name="location" label="Location" value={formData.location} onChange={handleChange} error={errors.location} placeholder="e.g., A1-01" />
                        <Input name="supplierId" label="Supplier *" value={formData.supplierId} onChange={handleChange} error={errors.supplierId}>
                            <select>
                                <option value="">Select Supplier</option>
                                {suppliers.map(sup => <option key={sup.id} value={sup.id}>{sup.name}</option>)}
                            </select>
                        </Input>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button type="button" className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-md flex items-center" onClick={onCancel}>
                        <FaTimes className="mr-2" /> Cancel
                    </button>
                    <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center" disabled={loading}>
                        <FaSave className="mr-2" /> {loading ? 'Saving...' : (isEdit ? 'Update Part' : 'Create Part')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PartForm;
