import React, {useState} from 'react';
import {
    FaArrowLeft,
    FaEdit
} from 'react-icons/fa';
import {PAYMENT_METHODS} from './constants/invoiceConstants';
import './../../styles/invoices.css';
import './InvoiceDetails.css';
import {formatDateForInput} from "../helper/utils";

const InvoiceDetails = ({invoice, onEditInvoice, onCancel}) => {
    const [currentInvoice] = useState({
        email: invoice?.customerEmail || 'NA',
        phone: invoice?.customerPhone || 'NA',
        amount: invoice?.totalAmount - (invoice?.paidAmount || 0) || 0,
        outstandingBalance: invoice ? invoice.totalAmount - (invoice.amountPaid || 0) : 0,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: PAYMENT_METHODS[0],
        referenceNumber: invoice?.referenceNumber || 'NA',
        notes: invoice?.notes || 'NA'
    });
    // const amount = invoice?.totalAmount - (invoice?.paidAmount || 0) || 0;
    // const paymentDate = new Date().toISOString().split('T')[0];
    // const paymentMethod = PAYMENT_METHODS[0];
    // const reference = invoice?refernceNumber || 'NA';
    // const notes = invoice?notes || 'NA';
    // const outstandingBalance = invoice ? invoice.totalAmount - (invoice.paidAmount || 0) : 0;

    return (
        <div className="payment-form-container">
            <div className="payment-form-header">
                <button className="back-button" onClick={onCancel}>
                    <FaArrowLeft/> Back to Invoices
                </button>
                <h2>Invoice #{invoice?.invoiceNumber}</h2>
                <button className="edit-button" onClick={() => onEditInvoice(invoice)}>
                    <FaEdit/> Edit
                </button>
            </div>

            <div className="payment-info">
                <div className="info-item">
                    <label>Invoice Total</label>
                    <span className="value total">₹ {(invoice?.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="info-item">
                    <label>Amount Paid</label>
                    <span className="value paid">₹{(invoice?.amountPaid || 0).toFixed(2)}</span>
                </div>
                <div className="info-item">
                    <label>Outstanding Balance</label>
                    <span className="value balance">₹{(invoice?.balanceDue || 0).toFixed(2)}</span>
                </div>
                <div className="info-item">
                    <span className="label">Status</span>
                    <span className={`status ${invoice?.status?.toLowerCase().replace(' ', '-')}`}>
                                {invoice?.status}
                        </span>
                </div>
            </div>

            <div className="invoice-content">
                <div className="invoice-info">
                    <div className="info-section">
                        <h2>Invoice Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Invoice Number:</span>
                                <span className="info-value">{invoice?.invoiceNumber || 'NA'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Invoice Date:</span>
                                <span className="info-value">{invoice?.invoiceDate || 'NA'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Due Date:</span>
                                <span className="info-value">{invoice?.dueDate || 'NA'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h2>Customer Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <span className="info-label">Customer Name:</span>
                                <span className="info-value">{invoice?.customerName || 'NA'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Email:</span>
                                <span className="info-value">{invoice?.email || 'NA'}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Phone:</span>
                                <span className="info-value">{invoice?.phone || 'NA'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="payment-details">
                    <h2>Payment Details</h2>
                    {invoice?.payments?.length > 0 ? (
                        <div className="payments-table">
                            <div className="table-header">
                                <div className="table-cell">Amount</div>
                                <div className="table-cell">Payment Date</div>
                                <div className="table-cell">Payment Method</div>
                                <div className="table-cell">Reference Number</div>
                                <div className="table-cell">Notes</div>
                            </div>
                            {invoice.payments.map(payment => (
                                <div key={invoice.id} className="table-row">
                                    <div className="table-cell amount">₹{payment.amount}</div>
                                    <div className="table-cell">{formatDateForInput(payment.paymentDate) || 'NA'}</div>
                                    <div className="table-cell method">{payment.paymentMethod}</div>
                                    <div className="table-cell reference">{payment?.paymentReference || 'NA'}</div>
                                    <div className="table-cell notes">{payment?.notes}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-payments">
                            <p>No payments recorded for this invoice.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetails;