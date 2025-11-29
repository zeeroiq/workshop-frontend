import React, { useState } from 'react';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { invoiceService } from '../../services/invoiceService';
import { PAYMENT_METHODS } from './constants/invoiceConstants';
import '../../styles/invoices.css';
import {todayDate} from "../helper/utils";
import ProcessUPI from "../payment/ProcessUPI";

const PaymentForm = ({ invoice, onSave, onCancel }) => {
    const [upiPaymentFlow, setUpiPaymentFlow] = useState(false);
    const [QRData, setQRData] = useState();
    const [formData, setFormData] = useState({
        customerId: invoice?.customerId || '',
        invoiceNumber: invoice?.invoiceNumber || '',
        amount: (invoice?.totalAmount - (invoice?.amountPaid || 0)).toFixed(2) || 0,
        paymentDate: todayDate(),
        paymentMethod: PAYMENT_METHODS[0],
        reference: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === 'amount') {
            processedValue = value === '' ? '' : Number.parseFloat(value).toFixed(2);
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // depending on the option selected, enable rendering of respective payment option fields
        // for now we keep it simple, we'll just support cash/UPI
        if (name === 'paymentMethod' && value === 'UPI') {
            setUpiPaymentFlow(true);
        } else {
            setUpiPaymentFlow(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const outstandingBalance = invoice.totalAmount - (invoice.amountPaid || 0);

        if (!formData?.amount || formData?.amount <= 0) {
            newErrors.amount = 'Valid payment amount is required';
        } else if (formData?.amount > outstandingBalance) {
            newErrors.amount = `Payment cannot exceed outstanding balance of ₹ ${outstandingBalance.toFixed(2)}`;
        }

        if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
        if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await invoiceService.addPaymentToInvoice(invoice.id, formData);
            onSave();
        } catch (error) {
            console.error('Error adding payment:', error);
        }
    };

    const outstandingBalance = invoice ? invoice.totalAmount - (invoice.amountPaid || 0) : 0;

    return (
        <div className="payment-form-container">
            <div className="payment-form-header">
                <button className="back-button" onClick={onCancel}>
                    <FaArrowLeft /> Back to Invoices
                </button>
                <h2>Add Payment to Invoice #{invoice?.invoiceNumber}</h2>
            </div>

            <div className="payment-info">
                <div className="info-item">
                    <label>Customer:</label>
                    <span>{invoice?.customerName}</span>
                </div>
                <div className="info-item">
                    <label>Invoice Total:</label>
                    <span>₹{invoice?.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="info-item">
                    <label>Amount Paid:</label>
                    <span>₹{(invoice?.amountPaid || 0).toFixed(2)}</span>
                </div>
                <div className="info-item">
                    <label>Outstanding Balance:</label>
                    <span className="outstanding-balance">₹{outstandingBalance.toFixed(2)}</span>
                </div>
            </div>

            <form className="payment-form" onSubmit={handleSubmit}>
                <div className="form-section">
                    <h3>Payment Details</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Amount *</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className={errors.amount ? 'error' : ''}
                                step="0.01"
                                min="0"
                                max={outstandingBalance}
                            />
                            {errors.amount && <span className="error-text">{errors.amount}</span>}
                        </div>
                        <div className="form-group">
                            <label>Payment Date *</label>
                            <input
                                type="date"
                                name="paymentDate"
                                value={formData.paymentDate}
                                onChange={handleChange}
                                className={errors.paymentDate ? 'error' : ''}
                            />
                            {errors.paymentDate && <span className="error-text">{errors.paymentDate}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Payment Method *</label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                className={errors.paymentMethod ? 'error' : ''}
                            >
                                {PAYMENT_METHODS.map(method => (
                                    <option key={method} value={method}>
                                        {method.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                            {errors.paymentMethod && <span className="error-text">{errors.paymentMethod}</span>}
                        </div>
                        <div className="form-group">
                            <label>Reference Number</label>
                            <input
                                type="text"
                                name="reference"
                                value={formData.reference}
                                onChange={handleChange}
                                placeholder="Check #, Transaction ID, etc."
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Additional payment notes"
                        />
                    </div>
                    {upiPaymentFlow && (
                        <ProcessUPI amount={formData?.amount} customerId={formData.customerId} transactionNote="transaction note"/>
                    )}
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onCancel}>
                        <FaTimes /> Cancel
                    </button>
                    <button type="submit" className="save-btn">
                        <FaSave /> Add Payment
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentForm;