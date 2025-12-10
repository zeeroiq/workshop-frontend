import React, { useState, useEffect } from 'react';
import {
    FaArrowLeft,
    FaSave,
    FaTimes,
    FaPlus,
    FaTrash
} from 'react-icons/fa';
import { invoiceService } from '@/services/invoiceService';
import { INVOICE_STATUS } from './constants/invoiceConstants';
import '../../styles/Invoices.css';
import {customerService} from "@/services/customerService";
import {toast} from "react-toastify";

const InvoiceForm = ({ invoice, onSave, onCancel }) => {
    const isEdit = Boolean(invoice && invoice.id);

    const [formData, setFormData] = useState({
        invoiceNumber: '',
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerAddress: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        parts: [],
        notes: '',
        terms: '',
        status: INVOICE_STATUS.DRAFT
    });

    const [newItem, setNewItem] = useState({
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxRate: 0
    });

    const [errors, setErrors] = useState({});
    const [customers, setCustomers] = useState([]);
    const isEditMode = Boolean(invoice?.invoiceNumber);

    useEffect(() => {
        if (invoice) {
            setFormData({
                invoiceNumber: invoice.invoiceNumber || '',
                customerId: invoice.customerId || '',
                customerName: invoice.customerName || '',
                customerEmail: invoice.customerEmail || '',
                customerAddress: invoice.customerAddress || '',
                invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : '',
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
                parts: invoice.parts || [],
                notes: invoice.notes || '',
                terms: invoice.terms || '',
                status: invoice.status || INVOICE_STATUS.DRAFT
            });
        }

        // Load customers (in a real app, this would come from an API)
        loadCustomers();
    }, [invoice]);

    const loadCustomers = async () => {
        try {
            const response = await customerService.listAll();
            if (response?.data?.content) {
                setCustomers(response.data.content);
            } else {
                toast.error('Failed to fetch customers - ', response?.data?.message || 'Unknown error');
            }
        } catch (error) {
            toast.error('Failed to fetch customers');
            console.error('Error fetching customers:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // If customer is selected from dropdown, populate customer details
        if (name === 'customerId') {
            const selectedCustomer = customers.find(c => c.id.toString() === value);
            if (selectedCustomer) {
                setFormData(prev => ({
                    ...prev,
                    customerName: selectedCustomer.firstName + ' ' + selectedCustomer.lastName,
                    customerEmail: selectedCustomer.email,
                    customerAddress: selectedCustomer.address
                }));
            }
        }

        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleItemChange = (e) => {
        const { name, value } = e.target;
        setNewItem(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddItem = () => {
        if (!newItem.description || newItem.quantity <= 0 || newItem.unitPrice < 0) return;

        const itemTotal = newItem.quantity * newItem.unitPrice;
        const taxAmount = itemTotal * (newItem.taxRate / 100);

        setFormData(prev => ({
            ...prev,
            parts: [
                ...prev.parts,
                {
                    ...newItem,
                    quantity: parseFloat(newItem.quantity),
                    unitPrice: parseFloat(newItem.unitPrice),
                    taxRate: parseFloat(newItem.taxRate),
                    totalPrice: itemTotal + taxAmount
                }
            ]
        }));

        setNewItem({
            description: '',
            quantity: 1,
            unitPrice: 0,
            taxRate: 0
        });
    };

    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            parts: prev.parts.filter((_, i) => i !== index)
        }));
    };

    const calculateTotal = () => {
        return formData.parts.reduce((sum, item) => sum + item.totalPrice, 0);
    };

    const validateForm = () => {
        const newErrors = {};

        if (isEditMode && !formData.invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice number is required';
        if (!formData.customerId) newErrors.customerId = 'Customer is required';
        if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
        if (!formData.invoiceDate) newErrors.invoiceDate = 'Invoice date is required';
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
        if (formData.parts.length === 0) newErrors.parts = 'At least one item is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const invoiceData = {
                ...formData,
                totalAmount: calculateTotal()
            };

            if (isEdit) {
                await invoiceService.updateInvoice(invoice.id, invoiceData);
            } else {
                await invoiceService.createInvoice(invoiceData);
            }

            onSave();
        } catch (error) {
            console.error('Error saving invoice:', error);
        }
    };

    return (
        <div className="invoice-form-container">
            <div className="invoice-form-header">
                <button className="back-button" onClick={onCancel}>
                    <FaArrowLeft /> Back to Invoices
                </button>
                <h2>{isEdit ? 'Edit Invoice' : 'Create New Invoice'}</h2>
            </div>

            <form className="invoice-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Invoice Details</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Invoice Number *</label>
                            <input
                                type="text"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                placeholder={!isEditMode ? "AUTO GENERATED" : "e.g., PO-2023-1001"}
                                onChange={handleChange}
                                className={errors.invoiceNumber ? 'error' : ''}
                                disabled
                            />
                            {errors.invoiceNumber && <span className="error-text">{errors.invoiceNumber}</span>}
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled
                            >
                                {
                                    Object.values(INVOICE_STATUS).map(status => (
                                        <option key={status} value={status}>
                                            {status.charAt(0) + status.slice(1).toLowerCase()}
                                        </option>
                                    ))
                                }
                                {/*<option value="DRAFT">Draft</option>*/}
                                {/*<option value="SENT">Sent</option>*/}
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Invoice Date *</label>
                            <input
                                type="date"
                                name="invoiceDate"
                                value={formData.invoiceDate}
                                onChange={handleChange}
                                className={errors.invoiceDate ? 'error' : ''}
                            />
                            {errors.invoiceDate && <span className="error-text">{errors.invoiceDate}</span>}
                        </div>
                        <div className="form-group">
                            <label>Due Date *</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className={errors.dueDate ? 'error' : ''}
                            />
                            {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Customer Information</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Customer *</label>
                            <select
                                name="customerId"
                                value={formData.customerId}
                                onChange={handleChange}
                                className={errors.customerId ? 'error' : ''}
                            >
                                <option value="">Select Customer</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.firstName + ' ' + customer.lastName}
                                    </option>
                                ))}
                            </select>
                            {errors.customerId && <span className="error-text">{errors.customerId}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Customer Name *</label>
                            <input
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                onChange={handleChange}
                                className={errors.customerName ? 'error' : ''}
                                disabled={formData?.customerName}
                            />
                            {errors.customerName && <span className="error-text">{errors.customerName}</span>}
                        </div>
                        <div className="form-group">
                            <label>Customer Email</label>
                            <input
                                type="email"
                                name="customerEmail"
                                value={formData.customerEmail}
                                onChange={handleChange}
                                disabled={formData?.customerName} //
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Customer Address</label>
                        <textarea
                            name="customerAddress"
                            value={formData.customerAddress}
                            onChange={handleChange}
                            rows={2}
                            disabled={formData?.customerAddress}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h3>Invoice Items</h3>
                    {errors.parts && <span className="error-text">{errors.parts}</span>}

                    <div className="item-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={newItem.description}
                                    onChange={handleItemChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={newItem.quantity}
                                    onChange={handleItemChange}
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Unit Price</label>
                                <input
                                    type="number"
                                    name="unitPrice"
                                    value={newItem.unitPrice}
                                    onChange={handleItemChange}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label>Tax Rate (%)</label>
                                <input
                                    type="number"
                                    name="taxRate"
                                    value={newItem.taxRate}
                                    onChange={handleItemChange}
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                            </div>
                            <div className="form-group">
                                <label>&nbsp;</label>
                                <button type="button" className="add-item-btn" onClick={handleAddItem}>
                                    <FaPlus /> Add Item
                                </button>
                            </div>
                        </div>
                    </div>

                    {formData.parts.length > 0 && (
                        <div className="items-table">
                            <table>
                                <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Tax Rate</th>
                                    <th>Total</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {formData.parts.map((item, index) => (
                                    <tr key={index}>
                                        <td>{item.description}</td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item?.unitPrice?.toFixed(2)}</td>
                                        <td>{item?.taxRate}%</td>
                                        <td>₹{item?.totalPrice?.toFixed(2)}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className="remove-item-btn"
                                                onClick={() => handleRemoveItem(index)}
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr>
                                    <td colSpan="4" className="total-label">Total Amount:</td>
                                    <td className="total-amount">₹{calculateTotal().toFixed(2)}</td>
                                    <td></td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <h3>Additional Information</h3>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Additional notes for the customer"
                        />
                    </div>

                    <div className="form-group">
                        <label>Terms & Conditions</label>
                        <textarea
                            name="terms"
                            value={formData.terms}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Payment terms and conditions"
                            disabled
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onCancel}>
                        <FaTimes /> Cancel
                    </button>
                    <button type="submit" className="save-btn">
                        <FaSave /> {isEdit ? 'Update Invoice' : 'Create Invoice'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default InvoiceForm;