import React, { useState, useEffect } from 'react';
import { Eye, Edit, Plus, Search, Calendar, Truck, IndianRupee } from 'lucide-react';
import { inventoryService } from "@/services/inventoryService";
import { toast } from "react-toastify";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaginationComponent from "@/components/common/PaginationComponent";
import { formatDate } from "../Utils";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';

const PurchaseOrderList = ({ onViewDetails, onEdit, onCreate }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchPurchaseOrders();
    }, [currentPage, searchTerm, statusFilter]);

    const fetchPurchaseOrders = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                size: 10,
                sort: 'orderDate,desc',
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter !== 'all' && { status: statusFilter })
            };
            const response = await inventoryService.getPurchaseOrders(params);
            if (response?.data?.success) {
                setOrders(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
            toast.error('Failed to fetch purchase orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'PENDING': return 'warning';
            case 'ORDERED': return 'info';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'destructive';
            default: return 'secondary';
        }
    };

    const columns = [
        {
            header: "Order #",
            accessor: "orderNumber",
            cell: (row) => <span className="font-mono font-bold">{row.orderNumber}</span>
        },
        {
            header: "Supplier",
            accessor: "supplierName",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <Truck size={14} className="text-muted-foreground" />
                    <span className="font-medium">{row.supplierName}</span>
                </div>
            )
        },
        {
            header: "Order Date",
            cell: (row) => <span className="text-muted-foreground text-xs">{formatDate(row.orderDate)}</span>
        },
        {
            header: "Total",
            cell: (row) => (
                <div className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                    <IndianRupee size={12} className="mr-0.5" />
                    {row.totalAmount.toFixed(2)}
                </div>
            )
        },
        {
            header: "Status",
            cell: (row) => (
                <Badge variant={getStatusVariant(row.status)} className="text-[10px] uppercase font-bold">
                    {row.status}
                </Badge>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (row, isTablet) => {
                const isFinalized = row.status === 'COMPLETED' || row.status === 'CANCELLED';
                return (
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" onClick={() => onViewDetails(row)}>
                            <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            {!isTablet && <span className="ml-2">View</span>}
                        </Button>
                        {!isFinalized && (
                            <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" onClick={() => onEdit(row)}>
                                <Edit className="h-4 w-4 text-primary" />
                                {!isTablet && <span className="ml-2 text-primary">Edit</span>}
                            </Button>
                        )}
                    </div>
                );
            }
        }
    ];

    const renderOrderCard = (order) => (
        <Card 
            className="overflow-hidden border-border/50 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => onViewDetails(order)}
        >
            <CardHeader className="pb-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <div className="flex flex-col">
                    <CardTitle className="text-lg font-mono font-bold group-hover:text-emerald-500 transition-colors">
                        {order.orderNumber}
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                        Ordered {formatDate(order.orderDate)}
                    </span>
                </div>
                <Badge variant={getStatusVariant(order.status)} className="font-bold">{order.status}</Badge>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Supplier</p>
                        <div className="flex items-center gap-2">
                            <Truck size={12} className="text-emerald-600 dark:text-emerald-400" />
                            <span className="font-medium truncate">{order.supplierName}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Total Amount</p>
                        <div className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                            <IndianRupee size={12} className="mr-0.5" />
                            {order.totalAmount.toFixed(2)}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider mb-1">Expected</p>
                        <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-muted-foreground" />
                            <span className="font-medium text-xs">{formatDate(order.expectedDeliveryDate)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <Button variant="outline" className="flex-1 h-11 gap-2 border-border/50" onClick={(e) => { e.stopPropagation(); onViewDetails(order); }}>
                        <Eye size={16} />
                        <span>View</span>
                    </Button>
                    {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                        <Button variant="outline" className="flex-1 h-11 gap-2 border-border/50" onClick={(e) => { e.stopPropagation(); onEdit(order); }}>
                            <Edit size={16} />
                            <span>Edit</span>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const filters = (
        <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by order # or supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-muted/30 border-border/50"
                />
            </div>
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-muted/30 border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="ORDERED">Ordered</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
            </select>
        </div>
    );

    const actions = (
        <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 gap-2">
            <Plus size={16} />
            <span>New Order</span>
        </Button>
    );

    return (
        <div className="pb-6">
            <ResponsiveDataContainer
                title="Purchase Orders"
                description="Track and manage procurement from your suppliers"
                actions={actions}
                filters={filters}
                columns={columns}
                data={orders}
                renderCard={renderOrderCard}
                onRowClick={onViewDetails}
                loading={loading}
                emptyMessage="No purchase orders found."
            />
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
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
