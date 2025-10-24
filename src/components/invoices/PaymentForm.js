import React, { useState } from 'react';
import { FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { invoiceService } from '../../services/invoiceService';
import { paymentService } from '../../services/paymentService'; // Import payment service for UPI
import { PAYMENT_METHODS } from './constants/invoiceConstants'; // Assuming 'UPI' is in this array
import './../../styles/invoices.css';
import {todayDate} from "../helper/utils";
import QRDisplay from "../payment/QRDisplay"; // Import the QRDisplay component

const PaymentForm = ({ invoice, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        invoiceNumber: invoice?.invoiceNumber || '',
        amount: invoice?.totalAmount - (invoice?.amountPaid || 0) || 0,
        paymentDate: todayDate(),
        paymentMethod: PAYMENT_METHODS[0],
        reference: '',
        notes: ''
    });

    const [errors, setErrors] = useState({});
    const [showUpiPayment, setShowUpiPayment] = useState(false);
    const [upiPaymentData, setUpiPaymentData] = useState(null);
    const [loadingUpi, setLoadingUpi] = useState(false);

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

    const handlePaymentMethodSelect = (method) => {
        setFormData(prev => ({
            ...prev,
            paymentMethod: method
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        const outstandingBalance = invoice.totalAmount - (invoice.amountPaid || 0);

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Valid payment amount is required';
        } else if (formData.amount > outstandingBalance) {
            newErrors.amount = `Payment cannot exceed outstanding balance of ₹${outstandingBalance.toFixed(2)}`;
        }

        if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
        if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        if (formData.paymentMethod === 'UPI') {
            handleUpiPayment();
            return;
        }

        try {
            await invoiceService.addPaymentToInvoice(invoice.id, formData);
            onSave();
        } catch (error) {
            console.error('Error adding payment:', error);
        }
    };

    const handleUpiPayment = async () => {
        setLoadingUpi(true);
        setErrors({});
        try {
            const upiOrderData = {
                amount: formData.amount,
                customerName: invoice.customerName,
                customerPhone: invoice.customerPhone || '9999999999', // A phone number is required
                description: `Payment for Invoice #${invoice.invoiceNumber}`
            };
            const response = await paymentService.createUPIPayment(upiOrderData);

            if (response.success && response.data) {
                setUpiPaymentData(response.data);
                setShowUpiPayment(true);
            } else {
                setErrors({ api: response.message || 'Failed to generate UPI QR code.' });
            }
        } catch (error) {
            console.error('Error creating UPI payment:', error);
            setErrors({ api: error.message || 'An unexpected error occurred.' });
        } finally {
            setLoadingUpi(false);
        }
    };

    const outstandingBalance = invoice ? invoice.totalAmount - (invoice.amountPaid || 0) : 0;

    if (showUpiPayment && upiPaymentData) {
        return (
            <div className="payment-form-container">
                <div className="payment-form-header">
                    <button className="back-button" onClick={() => setShowUpiPayment(false)}>
                        <FaArrowLeft /> Back to Payment Details
                    </button>
                    <h2>Pay with UPI</h2>
                </div>
                <QRDisplay qrData={upiPaymentData.qrCode} upiString={upiPaymentData.upiIntentUrl} orderId={upiPaymentData.orderId} amount={formData.amount} />
                {/* You can add the PaymentStatus component here to poll for success */}
            </div>
        );
    }

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
                            <div className="payment-method-selector">
                                {PAYMENT_METHODS.map(method => (
                                    <button
                                        type="button"
                                        key={method}
                                        className={`payment-method-btn ${formData.paymentMethod === method ? 'active' : ''}`}
                                        onClick={() => handlePaymentMethodSelect(method)}
                                    >
                                        {method.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                            {errors.paymentMethod && <span className="error-text">{errors.paymentMethod}</span>}
                        </div>
                        {/*<div className="form-group">*/}
                        {/*    <label>Reference Number</label>*/}
                        {/*    <input*/}
                        {/*        type="text"*/}
                        {/*        name="reference"*/}
                        {/*        value={formData.reference}*/}
                        {/*        onChange={handleChange}*/}
                        {/*        placeholder="Check #, Transaction ID, etc."*/}
                        {/*    />*/}
                        {/*</div>*/}
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
                </div>

                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={onCancel}>
                        <FaTimes /> Cancel
                    </button>
                    <button type="submit" className="save-btn" disabled={loadingUpi}>
                        {loadingUpi ? 'Generating QR...' : <><FaSave /> Add Payment</>}
                        {/* <FaSave /> Add Payment */}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentForm;