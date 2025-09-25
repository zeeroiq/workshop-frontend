import React, { useState } from 'react';
import InvoiceList from './InvoiceList';
import InvoiceForm from './InvoiceForm';
import PaymentForm from './PaymentForm';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import './../../styles/invoices.css';
import InvoiceDetails from "./InvoiceDetails";

const Invoice = () => {
    const [activeView, setActiveView] = useState('list');
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setActiveView('details');
    };

    const handleEditInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setActiveView('form');
    };

    const handleCreateInvoice = () => {
        setSelectedInvoice(null);
        setActiveView('form');
    };

    const handleAddPayment = (invoice) => {
        setSelectedInvoice(invoice);
        setActiveView('payment');
    };

    const handleBackToList = () => {
        setActiveView('list');
        setSelectedInvoice(null);
    };

    const renderView = () => {
        switch (activeView) {
            case 'list':
                return (
                    <InvoiceList
                        onViewInvoice={handleViewInvoice}
                        onEditInvoice={handleEditInvoice}
                        onCreateInvoice={handleCreateInvoice}
                        onAddPayment={handleAddPayment}
                    />
                );
            case 'details':
                return (
                    <InvoiceDetails
                        invoice={selectedInvoice}
                        onEditInvoice={handleEditInvoice}
                        onCancel={handleBackToList}
                    />
                );
            case 'form':
                return (
                    <InvoiceForm
                        invoice={selectedInvoice}
                        onSave={handleBackToList}
                        onCancel={handleBackToList}
                    />
                );
            case 'payment':
                return (
                    <PaymentForm
                        invoice={selectedInvoice}
                        onSave={handleBackToList}
                        onCancel={handleBackToList}
                    />
                );
            default:
                return <InvoiceList onCreateInvoice={handleCreateInvoice} />;
        }
    };

    return (
        <div className="invoice-module">
            <div className="module-header">
                <FaFileInvoiceDollar className="module-icon" />
                <h2>Invoice Management</h2>
            </div>
            {renderView()}
        </div>
    );
};

export default Invoice;