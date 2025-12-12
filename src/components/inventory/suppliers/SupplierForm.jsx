import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { inventoryService } from '@/services/inventoryService';
import { toast } from "react-toastify";

const SupplierForm = ({ supplier, onSave, onCancel }) => {
    const isEdit = Boolean(supplier && supplier.id);

    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        paymentTerm: 'NET_30',
        status: 'ACTIVE',
        notes: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name || '',
                contactPerson: supplier.contactPerson || '',
                email: supplier.email || '',
                phone: supplier.phone || '',
                address: supplier.address || '',
                paymentTerm: supplier.paymentTerm || 'NET_30',
                status: supplier.status || 'ACTIVE',
                notes: supplier.notes || ''
            });
        }
    }, [supplier]);

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
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (isEdit) {
                await inventoryService.updateSupplier(supplier.id, formData);
                toast.success('Supplier updated successfully!');
            } else {
                await inventoryService.createSupplier(formData);
                toast.success('Supplier created successfully!');
            }
            onSave();
        } catch (error) {
            console.error('Error saving supplier:', error);
            toast.error(error?.response?.data?.message || 'Failed to save supplier.');
        } finally {
            setLoading(false);
        }
    };

    const paymentTermsOptions = [
        { value: 'NET_15', label: 'Net 15' },
        { value: 'NET_30', label: 'Net 30' },
        { value: 'NET_60', label: 'Net 60' },
        { value: 'DUE_ON_RECEIPT', label: 'Due on Receipt' }
    ];

    const statusOptions = [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' }
    ];

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
                    <FaArrowLeft className="mr-2" /> Back to Suppliers
                </button>
                <h2 className="text-xl font-semibold">{isEdit ? 'Edit Supplier' : 'Add New Supplier'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="p-5 border border-border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input name="name" label="Company Name *" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Enter company name" />
                        <Input name="contactPerson" label="Contact Person *" value={formData.contactPerson} onChange={handleChange} error={errors.contactPerson} placeholder="Enter contact person name" />
                        <Input name="email" label="Email *" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="Enter email address" />
                        <Input name="phone" label="Phone *" value={formData.phone} onChange={handleChange} error={errors.phone} placeholder="Enter phone number" />
                    </div>
                </div>

                <div className="p-5 border border-border rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <Input name="address" label="Address" value={formData.address} onChange={handleChange} error={errors.address} placeholder="Enter full address" />
                        </div>
                        <Input name="paymentTerm" label="Payment Terms" value={formData.paymentTerm} onChange={handleChange} error={errors.paymentTerm}>
                            <select>
                                {paymentTermsOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                        </Input>
                        <Input name="status" label="Status" value={formData.status} onChange={handleChange} error={errors.status}>
                            <select>
                                {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                        </Input>
                        <div className="md:col-span-2">
                            <Input name="notes" label="Notes" value={formData.notes} onChange={handleChange} error={errors.notes}>
                                <textarea rows={3} placeholder="Additional notes about this supplier" />
                            </Input>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button type="button" className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-md flex items-center" onClick={onCancel}>
                        <FaTimes className="mr-2" /> Cancel
                    </button>
                    <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center" disabled={loading}>
                        <FaSave className="mr-2" /> {loading ? 'Saving...' : (isEdit ? 'Update Supplier' : 'Create Supplier')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SupplierForm;
