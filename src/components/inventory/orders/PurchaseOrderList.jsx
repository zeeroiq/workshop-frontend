import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaPlus, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaMoneyBillWave } from 'react-icons/fa';
import { inventoryService } from "@/services/inventoryService";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PaginationComponent from "@/components/common/PaginationComponent";
import { formatDate } from "../Utils";

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

    const getStatusVariant = (status) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'PENDING': return 'warning';
            case 'ORDERED': return 'info';
            case 'PARTIALLY_RECEIVED': return 'secondary';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusClass = (status) => {
        const s = (status || '').toUpperCase();
        switch (s) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'ORDERED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'PARTIALLY_RECEIVED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Purchase Orders</h2>
                    <p className="text-muted-foreground">Track and manage your part orders</p>
                </div>
                <Button className="w-full sm:w-auto" onClick={onCreate}>
                    <FaPlus className="mr-2" /> New Purchase Order
                </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="relative w-full md:w-1/2">
                    <FaSearch className="absolute top-3 left-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by order # or supplier..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-input pl-10 pr-4 py-2 rounded-md w-full focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                </div>
                <div className="relative w-full md:w-auto">
                    <FaFilter className="absolute top-3 left-3 text-muted-foreground pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="bg-input pl-10 pr-8 py-2 rounded-md appearance-none w-full outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
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

            {/* Desktop View */}
            <div className="hidden xl:block overflow-x-auto rounded-md border border-border/50">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Order #</th>
                            <th className="px-6 py-4 font-semibold">Supplier</th>
                            <th className="px-6 py-4 font-semibold">Order Date</th>
                            <th className="px-6 py-4 font-semibold">Expected Date</th>
                            <th className="px-6 py-4 font-semibold">Total</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {orders.map(order => {
                            const s = (order.status || '').toUpperCase();
                            const isDisabled = s === 'COMPLETED' || s === 'CANCELLED';
                            return (
                                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-primary">{order.orderNumber}</td>
                                    <td className="px-6 py-4 font-medium">{order.supplierName}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{formatDate(order.orderDate)}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{formatDate(order.expectedDeliveryDate)}</td>
                                    <td className="px-6 py-4 font-bold text-emerald-500">₹{order.totalAmount.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${getStatusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => onViewDetails(order)} title="View Details">
                                                <FaEye />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={isDisabled ? 'opacity-30 cursor-not-allowed' : 'text-blue-500'}
                                                onClick={() => !isDisabled && onEdit(order)}
                                                disabled={isDisabled}
                                                title={isDisabled ? `Cannot edit ${order.status.toLowerCase()} order` : "Edit Order"}
                                            >
                                                <FaEdit />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile/Tablet View */}
            <div className="xl:hidden space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-muted/20 rounded-lg">
                        <p className="text-muted-foreground">No purchase orders found.</p>
                    </div>
                ) : (
                    orders.map((order) => {
                        const s = (order.status || '').toUpperCase();
                        const isDisabled = s === 'COMPLETED' || s === 'CANCELLED';
                        return (
                            <Card key={order.id} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-bold">{order.orderNumber}</CardTitle>
                                            <p className="text-sm text-primary font-medium flex items-center gap-2">
                                                <FaUser className="text-[10px]" /> {order.supplierName}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${getStatusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Order Date</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <FaCalendarAlt className="text-[10px]" /> {formatDate(order.orderDate)}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Expected</p>
                                            <p className="font-medium flex items-center gap-2">
                                                <FaCalendarAlt className="text-[10px]" /> {formatDate(order.expectedDeliveryDate)}
                                            </p>
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Total Amount</p>
                                            <p className="text-lg font-bold text-emerald-500 flex items-center gap-2">
                                                <FaMoneyBillWave className="text-sm" /> ₹{order.totalAmount.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/50">
                                        <Button variant="outline" size="sm" onClick={() => onViewDetails(order)} className="flex-1">
                                            <FaEye className="mr-2" /> View
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => !isDisabled && onEdit(order)} 
                                            disabled={isDisabled}
                                            className={`flex-1 ${isDisabled ? 'opacity-30' : 'text-blue-500'}`}
                                        >
                                            <FaEdit className="mr-2" /> Edit
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
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
