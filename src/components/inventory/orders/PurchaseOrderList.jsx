import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import { inventoryService } from "@/services/inventoryService";
import { toast } from "react-toastify";
import PaginationComponent from "@/components/common/PaginationComponent";
import { formatDate } from "../Utils";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
            if (response?.data?.success && response.data) {
                setOrders(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold">Purchase Orders</h2>
                <Button type="button" onClick={onCreate}>
                    <FaPlus className="mr-2" /> New Purchase Order
                </Button>
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full lg:flex-1">
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by order number or supplier"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="min-h-11 w-full rounded-md border border-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:min-h-10"
                    />
                </div>
                <div className="relative w-full lg:w-auto">
                    <FaFilter className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="min-h-11 w-full appearance-none rounded-md border border-border bg-input pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring lg:min-h-10 lg:w-auto"
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

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Order Date</TableHead>
                        <TableHead>Expected Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                No orders found
                            </TableCell>
                        </TableRow>
                    ) : (
                        orders.map(order => {
                            const isDisabled = order.status.toUpperCase() === 'COMPLETED' || order.status.toUpperCase() === 'CANCELLED';
                            return (
                                <TableRow
                                    key={order.id}
                                    className="cursor-pointer"
                                    onClick={() => onViewDetails(order)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            onViewDetails(order);
                                        }
                                    }}
                                    tabIndex={0}
                                    role="button"
                                >
                                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                    <TableCell>{order.supplierName}</TableCell>
                                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                                    <TableCell>{formatDate(order.expectedDeliveryDate)}</TableCell>
                                    <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-wrap items-center justify-end gap-2">
                                            <Button type="button" variant="ghost" size="icon" className="text-primary hover:text-primary/80" onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetails(order);
                                            }} aria-label={`View order ${order.orderNumber}`}>
                                                <FaEye />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-blue-500 hover:text-blue-700"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isDisabled) onEdit(order);
                                                }}
                                                disabled={isDisabled}
                                                title={isDisabled ? `Cannot edit ${order.status.toLowerCase()} order` : "Edit Order"}
                                                aria-label={`Edit order ${order.orderNumber}`}
                                            >
                                                <FaEdit />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
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
