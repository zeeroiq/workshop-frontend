import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { inventoryService } from "@/services/inventoryService";
import { toast } from "react-toastify";
import PaginationComponent from "@/components/common/PaginationComponent";

const PurchaseOrderList = ({ onViewDetails, onEdit, onCreate }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchPurchaseOrders();
    }, [currentPage, searchTerm, statusFilter]);

    const fetchPurchaseOrders = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                size: pageSize,
                sort: 'orderDate,desc',
            };
            if (searchTerm) {
                params.search = searchTerm;
            }
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const response = await inventoryService.getPurchaseOrders(params);
            if (response?.data?.success && response.data.data) {
                setOrders(response.data.data.content || []);
                setTotalPages(response.data.data.totalPages || 0);
            } else {
                setOrders([]);
                setTotalPages(0);
                toast.warn('Failed to fetch purchase orders');
            }
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
            toast.error('Failed to fetch purchase orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'ORDERED': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(0);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading purchase orders...</div>;
    }

    return (
        <div className="bg-card p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Purchase Orders</h2>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center" onClick={onCreate}>
                    <FaPlus className="mr-2" /> New Purchase Order
                </button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full md:w-1/2">
                    <FaSearch className="absolute top-3 left-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by order number or supplier"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-input pl-10 pr-4 py-2 rounded-md w-full"
                    />
                </div>
                <div className="relative">
                    <FaFilter className="absolute top-3 left-3 text-muted-foreground" />
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="bg-input pl-10 pr-4 py-2 rounded-md appearance-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="ORDERED">Ordered</option>
                        <option value="PARTIALLY_RECEIVED">Partially Received</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase">
                        <tr>
                            <th className="px-6 py-3">Order #</th>
                            <th className="px-6 py-3">Supplier</th>
                            <th className="px-6 py-3">Order Date</th>
                            <th className="px-6 py-3">Expected Date</th>
                            <th className="px-6 py-3">Total</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => {
                            const isDisabled = order.status.toUpperCase() === 'COMPLETED' || order.status.toUpperCase() === 'CANCELLED';
                            return (
                                <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                                    <td className="px-6 py-4 font-medium">{order.orderNumber}</td>
                                    <td className="px-6 py-4">{order.supplierName}</td>
                                    <td className="px-6 py-4">{formatDate(order.orderDate)}</td>
                                    <td className="px-6 py-4">{formatDate(order.expectedDeliveryDate)}</td>
                                    <td className="px-6 py-4">₹{order.totalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button className="text-primary hover:text-primary/80" onClick={() => onViewDetails(order)}>
                                                <FaEye />
                                            </button>
                                            <button
                                                className={`text-blue-500 hover:text-blue-700 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => !isDisabled && onEdit(order)}
                                                disabled={isDisabled}
                                                title={isDisabled ? `Cannot edit ${order.status.toLowerCase()} order` : "Edit Order"}
                                            >
                                                <FaEdit />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {orders.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No orders found</p>
                    </div>
                )}
            </div>
            {totalPages > 1  && (
                <div className="mt-4 flex justify-center">
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
            </div>
                )}
        </div>
    );
};

export default PurchaseOrderList;
