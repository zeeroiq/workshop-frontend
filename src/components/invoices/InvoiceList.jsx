import React, { useState, useEffect } from 'react';
import {
    FaSearch,
    FaFilter,
    FaPlus,
    FaEye,
    FaEdit,
    FaMoneyBillWave,
    FaTrash,
    FaFilePdf,
    FaPaperPlane
} from 'react-icons/fa';
import { invoiceService } from '@/services/invoiceService';
import { INVOICE_STATUS_OPTIONS } from './constants/invoiceConstants';
import '../../styles/Invoices.css';
import {toast} from "react-toastify";

const InvoiceList = ({ onViewInvoice, onEditInvoice, onCreateInvoice, onAddPayment }) => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadInvoices();
    }, [currentPage, statusFilter]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage - 1,
                size: 10,
                ...(statusFilter !== 'all' && { status: statusFilter })
            };

            const response = await invoiceService.getAllInvoices(params);
            setInvoices(response.data.data.content || response.data.data);
            setTotalPages(response.data.data.totalPages || 1);
        } catch (error) {
            console.error('Error loading invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handleSendInvoice = async (invoiceId) => {
        try {
            await invoiceService.sendInvoice(invoiceId);
            loadInvoices(); // Refresh the list
        } catch (error) {
            console.error('Error sending invoice:', error);
        }
    };

    const handleCancelInvoice = async (invoiceId) => {
        try {
            await invoiceService.cancelInvoice(invoiceId);
            loadInvoices(); // Refresh the list
        } catch (error) {
            console.error('Error cancelling invoice:', error);
        }
    };

    const handleDeleteInvoice = async (invoiceId) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            try {
                await invoiceService.deleteInvoice(invoiceId);
                loadInvoices(); // Refresh the list
            } catch (error) {
                console.error('Error deleting invoice:', error);
            }
        }
    };

    const getStatusColor = (status) => {
        const statusOption = INVOICE_STATUS_OPTIONS.find(opt => opt.value === status);
        return statusOption ? statusOption.color : '#9e9e9e';
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const downloadInvoice = async (id) => {
        try {
            setLoading(true);

            // The service should be configured to return a blob
            const response = await invoiceService.exportInvoice(id);
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/pdf'
            });

            // Check if blob is valid
            if (blob.size === 0) {
                throw new Error('Server returned empty PDF file');
            }

            // Create download URL
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from headers or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = `invoice-${id}.pdf`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            link.download = filename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup
            window.URL.revokeObjectURL(url);

            toast.success('Invoice downloaded successfully!');

        } catch (error) {
            console.error('Error downloading invoice:', error);

            if (error.response?.status === 404) {
                toast.error('Invoice not found');
            } else if (error.response?.status === 500) {
                toast.error('Server error while generating PDF');
            } else {
                toast.error(error.message || 'Failed to download invoice');
            }
        } finally {
            setLoading(false);
        }
    };
            // if (response?.status !== 200) {
            //     toast.error(response.message || 'Failed to download invoice');
            //     return;
            // }
            //
            // const blob = new Blob([response.data], {
            //     type: 'application/pdf'
            // });
            //
            // // Check if blob is valid
            // if (blob.size === 0) {
            //     throw new Error('Received empty file from server');
            // }
            //
            // // Create download
            // const url = window.URL.createObjectURL(blob);
            // const link = document.createElement('a');
            // link.href = url;
            // link.download = `invoice-${id}-${new Date().getTime()}.pdf`;
            //
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
            //
            // // Cleanup
            // window.URL.revokeObjectURL(url);
            //
            // toast.success('Invoice downloaded successfully!');

            // let blob;
            // if (response.data instanceof Blob) {
            //     blob = response.data;
            // } else {
            //     blob = new Blob([response], { type: 'application/pdf' });
            // }
            //
            // // Create a blob URL from the response data and trigger download
            // const blobUrl = URL.createObjectURL(blob, { type: 'application/pdf' });
            // const a = document.createElement('a');
            // a.href = blobUrl;
            // a.download = `invoice-${id}.pdf`;
            // document.body.appendChild(a);
            // a.click();
            // document.body.removeChild(a);
            //
            // URL.revokeObjectURL(blobUrl);
            // toast.success('Invoice downloaded successfully!');
    //
    //     } catch (error) {
    //         console.error('Error downloading invoice:', error);
    //         toast.error('Failed to download invoice');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    if (loading) {
        return <div className="loading">Loading invoices...</div>;
    }

    return (
        <div className="invoice-list-container">
            <div className="invoice-list-header">
                <div className="header-left">
                    <h3>Invoices</h3>
                </div>
                <button className="create-button" onClick={onCreateInvoice}>
                    <FaPlus /> Create Invoice
                </button>
            </div>

            <div className="invoice-filters">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by invoice number or customer..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>

                <div className="filter-tabs">
                    <button
                        className={statusFilter === 'all' ? 'active' : ''}
                        onClick={() => handleStatusFilter('all')}
                    >
                        <FaFilter /> All
                    </button>
                    {INVOICE_STATUS_OPTIONS.map(status => (
                        <button
                            key={status.value}
                            className={statusFilter === status.value ? 'active' : ''}
                            onClick={() => handleStatusFilter(status.value)}
                            style={{ color: statusFilter === status.value ? status.color : '' }}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="invoices-table-container">
                <table className="invoices-table">
                    <thead>
                    <tr>
                        <th>Invoice #</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Due Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredInvoices.map(invoice => (
                        <tr key={invoice.id}>
                            <td className="invoice-number">{invoice.invoiceNumber}</td>
                            <td className="customer-name">{invoice.customerName}</td>
                            <td className="invoice-date">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                            <td className="due-date">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                            <td className="amount">₹{invoice.totalAmount.toFixed(2)}</td>
                            <td>
                  <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(invoice.status) }}
                  >
                    {INVOICE_STATUS_OPTIONS.find(s => s.value === invoice.status)?.label || invoice.status}
                  </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn-view"
                                        onClick={() => onViewInvoice(invoice)}
                                        title="View Details"
                                    >
                                        <FaEye />
                                    </button>
                                    {invoice.status === 'PAID' && invoice.status === 'CANCELLED' && (
                                        <button
                                            className="btn-edit"
                                            onClick={() => onEditInvoice(invoice)}
                                            title="Edit Invoice"
                                        >
                                            <FaEdit/>
                                        </button>
                                    )}
                                    {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                                        <button
                                            className="btn-payment"
                                            onClick={() => onAddPayment(invoice)}
                                            title="Add Payment"
                                        >
                                            <FaMoneyBillWave />
                                        </button>
                                    )}
                                    {invoice.status === 'DRAFT' && (
                                        <>
                                            <button
                                                className="btn-send"
                                                onClick={() => handleSendInvoice(invoice.id)}
                                                title="Send Invoice"
                                            >
                                                <FaPaperPlane />
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteInvoice(invoice.id)}
                                                title="Delete Invoice"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                    {invoice.status === 'SENT' && (
                                        <button
                                            className="btn-cancel"
                                            onClick={() => handleCancelInvoice(invoice.id)}
                                            title="Cancel Invoice"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                    <button
                                        className="btn-pdf"
                                        // onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
                                        onClick={() => downloadInvoice(invoice.id)}
                                        title="Download PDF"
                                    >
                                        <FaFilePdf />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {filteredInvoices.length === 0 && (
                    <div className="no-invoices">
                        <p>No invoices found</p>
                    </div>
                )}
            </div>

            <div className="pagination">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default InvoiceList;