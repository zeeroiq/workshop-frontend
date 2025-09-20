import React, {useState, useEffect} from 'react';
import {
    FaEye,
    FaEdit,
    FaPlus,
    FaSearch,
    FaFilter
} from 'react-icons/fa';
import {inventoryService} from "../../../services/inventoryService";
import './../../../styles/inventory/order/PurchaseOrder.css';
import {toast} from "react-toastify";

const PurchaseOrderList = ({onViewDetails, onEdit, onCreate}) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchPurchaseOrders();
    }, []);

    const fetchPurchaseOrders = async () => {
        try {
            setLoading(true);
            const response = await inventoryService.getPurchaseOrders();

            if (response?.data?.success) {
                setOrders(response.data.data);
            } else {
                console.error('Failed to fetch purchase orders:', response.data.data.message);
                toast.warn('Failed to fetch purchase orders');
            }
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
            if (error.response?.data?.error) {
                toast.error('Failed to fetch purchase orders');
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusClass = (status) => {
        switch (status) {
            case 'PENDING':
                return 'status-pending';
            case 'ORDERED':
                return 'status-ordered';
            case 'COMPLETED':
                return 'status-completed';
            case 'CANCELLED':
                return 'status-cancelled';
            default:
                return 'status-pending';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return <div className="loading">Loading purchase orders...</div>;
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    }

    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value);
    }

    const handleEditClick = (order) => {
        if (order.status.toUpperCase() === 'COMPLETED' || order.status.toUpperCase() === 'CANCELLED') {
            toast.warn(`Cannot edit ${order.status.toLowerCase()} order`);
            return;
        }
        onEdit(order);
    };


    return (
        <div className="purchase-order-list">
            <div className="list-header">
                <h2>Purchase Orders</h2>
                <button className="btn-primary" onClick={onCreate}>
                    <FaPlus/> New Purchase Order
                </button>
            </div>

            <div className="list-controls">
                <div className="search-box">
                    <FaSearch className="search-icon"/>
                    <input
                        type="text"
                        placeholder="Search by order number or supplier"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className="filter-box">
                    <FaFilter className="filter-icon"/>
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilter}
                    >
                        <option value="all">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="ORDERED">Ordered</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="orders-table">
                <div className="table-header">
                    <div>Order #</div>
                    <div>Supplier</div>
                    <div>Order Date</div>
                    <div>Expected Date</div>
                    <div>Total Amount</div>
                    <div>Status</div>
                    <div>Actions</div>
                </div>
                <div className="table-body">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => {
                            const isDisabled = order.status.toUpperCase() === 'COMPLETED' || order.status.toUpperCase() === 'CANCELLED';
                            return (
                                <div key={order.id} className="table-row">
                                    <div>{order.orderNumber}</div>
                                    <div>{order.supplierName}</div>
                                    <div>{formatDate(order.orderDate)}</div>
                                    <div>{formatDate(order.expectedDeliveryDate)}</div>
                                    <div>${order.totalAmount.toFixed(2)}</div>
                                    <div>
                                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                                        {order.status}
                                      </span>
                                    </div>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-icon"
                                            onClick={() => onViewDetails(order)}
                                            title="View Details"
                                        >
                                            <FaEye/>
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleEditClick(order)}
                                            disabled={isDisabled}
                                            title={isDisabled ? `Cannot edit ${order.status.toLowerCase()} order` : "Edit Order"}
                                        >
                                            <FaEdit/>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-orders">No orders found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderList;