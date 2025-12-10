import React, { useState, useEffect } from 'react';
import {
    FaArrowLeft,
    FaSave,
    FaTimes,
    FaUserTie,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaFileInvoiceDollar
} from 'react-icons/fa';
import { inventoryService } from '@/services/inventoryService';
import '../../../styles/inventory/supplier/SupplierForm.css';
import {toast} from "react-toastify";

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
    const [activeSection, setActiveSection] = useState('basic');

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
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

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
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            if (isEdit) {
                await inventoryService.updateSupplier(supplier.id, formData);
            } else {
                await inventoryService.createSupplier(formData);
            }

            onSave();
        } catch (error) {
            console.error('Error saving supplier:', error);
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            }

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

    return (
        <div className="supplier-form-container">
            <div className="supplier-form-header">
                <button className="back-button" onClick={onCancel}>
                    <FaArrowLeft />
                </button>
                <h2>{isEdit ? 'Edit Supplier' : 'Add New Supplier'}</h2>
            </div>

            <div className="form-sections">
                <div className="section-tabs">
                    <button
                        className={activeSection === 'basic' ? 'active' : ''}
                        onClick={() => setActiveSection('basic')}
                    >
                        Basic Info
                    </button>
                    <button
                        className={activeSection === 'additional' ? 'active' : ''}
                        onClick={() => setActiveSection('additional')}
                    >
                        Additional Info
                    </button>
                </div>

                <form className="supplier-form" onSubmit={handleSubmit}>
                    {activeSection === 'basic' && (
                        <div className="form-section">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <FaUserTie className="input-icon" /> Company Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={errors.name ? 'error' : ''}
                                        placeholder="Enter company name"
                                    />
                                    {errors.name && <span className="error-text">{errors.name}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <FaUser className="input-icon" /> Contact Person *
                                    </label>
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                        className={errors.contactPerson ? 'error' : ''}
                                        placeholder="Enter contact person name"
                                    />
                                    {errors.contactPerson && <span className="error-text">{errors.contactPerson}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <FaEnvelope className="input-icon" /> Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={errors.email ? 'error' : ''}
                                        placeholder="Enter email address"
                                    />
                                    {errors.email && <span className="error-text">{errors.email}</span>}
                                </div>
                                <div className="form-group">
                                    <label>
                                        <FaPhone className="input-icon" /> Phone *
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={errors.phone ? 'error' : ''}
                                        placeholder="Enter phone number"
                                    />
                                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                                </div>
                            </div>

                            <div className="section-navigation">
                                <button
                                    type="button"
                                    className="next-btn"
                                    onClick={() => setActiveSection('additional')}
                                >
                                    Next: Additional Info
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'additional' && (
                        <div className="form-section">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <FaMapMarkerAlt className="input-icon" /> Address
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter full address"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <FaFileInvoiceDollar className="input-icon" /> Payment Terms
                                    </label>
                                    <select
                                        name="paymentTerm"
                                        value={formData.paymentTerm}
                                        onChange={handleChange}
                                    >
                                        {paymentTermsOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group full-width">
                                    <label>Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows={3}
                                        placeholder="Additional notes about this supplier"
                                    />
                                </div>
                            </div>

                            <div className="section-navigation">
                                <button
                                    type="button"
                                    className="prev-btn"
                                    onClick={() => setActiveSection('basic')}
                                >
                                    Back to Basic Info
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onCancel}>
                            <FaTimes /> Cancel
                        </button>
                        <button type="submit" className="save-btn">
                            <FaSave /> {isEdit ? 'Update Supplier' : 'Create Supplier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierForm;