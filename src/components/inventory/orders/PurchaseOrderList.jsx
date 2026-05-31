import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaPlus, FaSearch, FaFilter, FaCalendarAlt, FaUser, FaMoneyBillWave, FaHashtag, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { inventoryService } from "@/services/inventoryService";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveActions from "@/components/common/ResponsiveActions";
import { formatDate } from "../Utils";
import { cn } from "@/lib/utils";

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
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== 'all') params.status = statusFilter;
            
            const response = await inventoryService.getPurchaseOrders(params);
            if (response?.data?.success && response.data) {
                setOrders(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            } else {
                setOrders([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error fetching purchase orders:', error);
            toast.error('Failed to fetch purchase orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        const s = (status || '').toUpperCase();
        const colors = {
            PENDING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            ORDERED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            PARTIALLY_RECEIVED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
            COMPLETED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border", colors[s] || 'bg-muted text-muted-foreground border-border/50');
    };

    const getOrderActions = (order) => {
        const s = (order.status || '').toUpperCase();
        const isDisabled = s === 'COMPLETED' || s === 'CANCELLED';
        return [
            {
                label: "Inspect Order",
                icon: <FaEye className="text-xs" />,
                onClick: () => onViewDetails(order),
                variant: "outline"
            },
            {
                label: "Modify Specs",
                icon: <FaEdit className="text-xs" />,
                onClick: () => onEdit(order),
                variant: "outline",
                disabled: isDisabled
            }
        ];
    };

    if (loading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary shadow-lg shadow-primary/20"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-screen-2xl mx-auto">
            {/* Header Transformation */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight uppercase leading-none text-center lg:text-left">Procurement: Orders</h2>
                    <p className="text-muted-foreground font-medium text-sm md:text-base opacity-70 text-center lg:text-left">Tracking node for part procurement cycles and supply chain status.</p>
                </div>
                <Button className="h-12 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-95 w-full lg:w-auto" onClick={onCreate}>
                    <FaPlus className="mr-2" /> Initialize Procurement
                </Button>
            </div>

            <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 p-6">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
                            <input
                                type="text"
                                placeholder="Search by serial # or provider node..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-11 pl-10 bg-background/50 border border-border/50 rounded-xl focus:ring-primary/20 font-bold text-sm"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop Matrix */}
                    <div className="hidden xl:block overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/10">
                                <tr className="border-b border-border/30">
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Order Serial</th>
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Provider Node</th>
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Temporal Pipeline</th>
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Valuation</th>
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Status</th>
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60 text-right">System Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="px-6 py-5">
                                            <span className="font-black text-foreground text-sm uppercase tracking-widest group-hover:text-primary transition-colors">
                                                {order.orderNumber}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-foreground uppercase">{order.supplierName}</span>
                                                <span className="text-[9px] text-muted-foreground opacity-60 uppercase font-black tracking-tighter mt-1 flex items-center gap-1.5">
                                                    <FaUser className="text-[8px]" /> Authorized Node
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-foreground flex items-center gap-1.5">
                                                    <FaClock className="text-[10px] opacity-40" /> ISS: {formatDate(order.orderDate)}
                                                </span>
                                                <span className="text-[9px] font-medium text-red-400/80 flex items-center gap-1.5 uppercase tracking-tighter">
                                                    <FaCalendarAlt className="text-[10px] opacity-40" /> EXP: {formatDate(order.expectedDeliveryDate)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-black text-emerald-500 text-sm">₹{order.totalAmount.toFixed(2)}</td>
                                        <td className="px-6 py-5">
                                            <span className={getStatusClass(order.status)}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <ResponsiveActions actions={getOrderActions(order)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Unit Decomposition */}
                    <div className="xl:hidden p-4 space-y-4">
                        {orders.length === 0 ? (
                            <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">Zero active nodes found</p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <Card key={order.id} className="border-border/50 bg-background/50 backdrop-blur-md shadow-lg rounded-3xl overflow-hidden active:scale-[0.98] transition-all">
                                    <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-black uppercase tracking-tight text-foreground leading-none">
                                                    {order.orderNumber}
                                                </CardTitle>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary leading-tight">{order.supplierName}</p>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-2">
                                                <span className={getStatusClass(order.status)}>
                                                    {order.status.split('_')[0]}
                                                </span>
                                                <ResponsiveActions actions={getOrderActions(order)} side="horizontal" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5"><FaMoneyBillWave className="text-[8px]" /> Valuation</p>
                                                <p className="font-black text-emerald-500 text-sm">₹{order.totalAmount.toFixed(2)}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center justify-end gap-1.5"><FaHashtag className="text-[8px]" /> Node ID</p>
                                                <p className="font-black text-foreground text-[10px] uppercase">#{order.id.toString().padStart(4, '0')}</p>
                                            </div>
                                            <div className="col-span-2 space-y-1 pt-2 border-t border-border/10">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Logistics Timeline</p>
                                                <div className="flex items-center justify-between text-[11px] font-bold">
                                                    <span className="flex items-center gap-2 text-foreground">
                                                        <FaClock className="text-primary opacity-50" /> Issued: {formatDate(order.orderDate)}
                                                    </span>
                                                    <span className="flex items-center gap-2 text-red-400">
                                                        Target: {formatDate(order.expectedDeliveryDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="pt-4 flex justify-center">
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default PurchaseOrderList;
