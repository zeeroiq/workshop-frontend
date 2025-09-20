import React from 'react';
import {
    FaArrowLeft,
    FaBoxOpen,
    FaCheckCircle,
    FaEdit,
    FaPrint,
    FaTimesCircle
} from 'react-icons/fa';
import './../../../styles/inventory/order/PurchaseOrder.css';

const PurchaseOrderDetails = ({order, onBack, onEdit}) => {

    if (!order) {
        return (
            <div className="purchase-order-details">
                <div className="details-header">
                    <button className="back-button" onClick={onBack}>
                        <FaArrowLeft/> Back to Orders
                    </button>
                    <h2>Orders Details</h2>
                    <div className="order-summary">
                        No Order Selected
                    </div>
                </div>
            </div>
        );
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <FaCheckCircle className="status-icon completed"/>;
            case 'ORDERED':
                return <FaBoxOpen className="status-icon ordered"/>;
            case 'CANCELLED':
                return <FaTimesCircle className="status-icon cancelled"/>;
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not received yet';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="purchase-order-details">
            <div className="details-header">
                <button className="back-button" onClick={onBack}>
                    <FaArrowLeft/> Back to List
                </button>
                <h2>Purchase Order Details</h2>
                <div className="header-actions">
                    <button className="edit-button" onClick={() => onEdit(order)}>
                        <FaEdit/> Edit
                    </button>
                    <button className="edit-button">
                        <FaPrint/> Print
                    </button>
                </div>
            </div>

            <div className="order-summary">
                <div className="summary-card">
                    <h3>Order Information</h3>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="label">Order Number:</span>
                            <span className="value">{order.orderNumber}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Order Date:</span>
                            <span className="value">{formatDate(order.orderDate)}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Expected Delivery Date:</span>
                            <span className="value">{formatDate(order.expectedDeliveryDate)}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Received Date:</span>
                            <span className="value">{formatDate(order.receivedDate)}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Status:</span>
                            <span className={`value status ${order.status.toLowerCase()}`}>
                {getStatusIcon(order.status)}
                                {order.status}
              </span>
                        </div>
                    </div>
                </div>

                <div className="summary-card">
                    <h3>Supplier Information</h3>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="label">Supplier:</span>
                            <span className="value">{order.supplierName}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Supplier ID:</span>
                            <span className="value">{order.supplierId}</span>
                        </div>
                    </div>
                </div>

                <div className="summary-card">
                    <h3>Financial Summary</h3>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="label">Total Amount:</span>
                            <span className="value">${order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="order-items">
                <h3>Order Items ({order.items?.length || 0})</h3>
                <div className="items-table">
                    <div className="table-header">
                        <div>Part Name</div>
                        <div>Part Number</div>
                        <div>Quantity</div>
                        <div>Unit Price</div>
                        <div>Total Price</div>
                    </div>
                    <div className="table-body">
                        {order.items && order.items.length > 0 ? (
                            order.items.map(item => (
                                <div key={item.id} className="table-row">
                                    <div>{item.partName}</div>
                                    <div>{item.partNumber}</div>
                                    <div>{item.quantity}</div>
                                    <div>${item.unitPrice.toFixed(2)}</div>
                                    <div>${item.totalPrice.toFixed(2)}</div>
                                </div>
                            ))
                        ) : (
                            <div className="no-items">No items in this order</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderDetails;