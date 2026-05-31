import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaEllipsisV, FaFilter, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCreditCard, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { inventoryService } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveActions from "@/components/common/ResponsiveActions";
import { cn } from "@/lib/utils";

const SupplierList = ({ onViewDetails, onEdit, onCreate }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        loadSuppliers();
    }, [currentPage, searchTerm, statusFilter]);

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                size: pageSize,
                sort: 'name,asc',
            };
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== 'all') params.status = statusFilter;
            
            const response = await inventoryService.getSuppliers(params);
            if (response?.data?.success && response.data) {
                setSuppliers(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            } else {
                setSuppliers([]);
                setTotalPages(0);
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
            toast.error('Failed to load suppliers.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const handleStatusFilterChange = (val) => {
        setStatusFilter(val);
        setCurrentPage(0);
    };

    const handleDeleteClick = (supplier) => {
        setSupplierToDelete(supplier);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await inventoryService.deleteSupplier(supplierToDelete.id);
            loadSuppliers();
            setDeleteDialogOpen(false);
            setSupplierToDelete(null);
            toast.success('Supplier deleted successfully.');
        } catch (error) {
            toast.error('Failed to delete supplier.');
        }
    };

    const toggleRowExpansion = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const getStatusBadge = (status) => {
        const s = (status || '').toUpperCase();
        const colors = {
            ACTIVE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            INACTIVE: 'bg-red-500/10 text-red-500 border-red-500/20',
            SUSPENDED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            DELETED: 'bg-muted text-muted-foreground border-border/50',
        };
        return (
            <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border", colors[s] || colors.DELETED)}>
                {s || 'UNKNOWN'}
            </span>
        );
    };

    const getSupplierActions = (supplier) => [
        {
            label: "Inspect Details",
            icon: <FaEye className="text-xs" />,
            onClick: () => onViewDetails(supplier),
            variant: "outline"
        },
        {
            label: "Modify Record",
            icon: <FaEdit className="text-xs" />,
            onClick: () => onEdit(supplier),
            variant: "outline"
        },
        {
            label: "Purge Node",
            icon: <FaTrash className="text-xs" />,
            onClick: () => handleDeleteClick(supplier),
            variant: "destructive"
        }
    ];

    if (loading && suppliers.length === 0) {
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
                    <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight uppercase leading-none">Logistics: Suppliers</h2>
                    <p className="text-muted-foreground font-medium text-sm md:text-base opacity-70">Managing node for registered resource providers and fulfillment channels.</p>
                </div>
                <Button className="h-12 px-8 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-95 w-full lg:w-auto" onClick={onCreate}>
                    <FaPlus className="mr-2" /> Initialize Supplier
                </Button>
            </div>

            <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 p-6">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
                            <input
                                type="text"
                                placeholder="Search by name, node ID or contact..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full h-11 pl-10 bg-background/50 border border-border/50 rounded-xl focus:ring-primary/20 font-bold text-sm"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop Matrix */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-muted/10">
                                <tr className="border-b border-border/30">
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Provider Node</th>
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Contact Analyst</th>
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60">Status</th>
                                    <th className="px-6 py-4 font-black uppercase tracking-widest text-[10px] opacity-60 text-right">System Controls</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {suppliers.map((supplier) => (
                                    <React.Fragment key={supplier.id}>
                                        <tr className="hover:bg-primary/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-foreground text-sm uppercase tracking-tight group-hover:text-primary transition-colors">
                                                        {supplier.name}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-muted-foreground opacity-60 flex items-center gap-2 mt-1 uppercase">
                                                        <FaEnvelope className="text-[8px]" /> {supplier.email || 'NO_DIGITAL_NODE'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground uppercase">{supplier.contactPerson || 'UNASSIGNED'}</span>
                                                    <span className="text-[10px] text-muted-foreground opacity-60 flex items-center gap-2 mt-1 uppercase font-black tracking-tighter">
                                                        <FaPhone className="text-[8px]" /> {supplier.phone}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">{getStatusBadge(supplier.status)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <ResponsiveActions actions={getSupplierActions(supplier)} />
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Unit Decomposition */}
                    <div className="lg:hidden p-4 space-y-4">
                        {suppliers.length === 0 ? (
                            <div className="text-center py-20 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50">Zero active nodes found</p>
                            </div>
                        ) : (
                            suppliers.map((supplier) => (
                                <Card key={supplier.id} className="border-border/50 bg-background/50 backdrop-blur-md shadow-lg rounded-3xl overflow-hidden active:scale-[0.98] transition-all">
                                    <CardHeader className="pb-3 border-b border-border/30 bg-muted/10">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg font-black uppercase tracking-tight text-foreground leading-none">
                                                    {supplier.name}
                                                </CardTitle>
                                                <p className="text-[9px] font-black tracking-widest text-primary uppercase opacity-70">Logistics Node ID: #{supplier.id}</p>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-2">
                                                {getStatusBadge(supplier.status)}
                                                <ResponsiveActions actions={getSupplierActions(supplier)} side="horizontal" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-1.5"><FaPhone className="text-[8px]" /> Hotline</p>
                                                <p className="font-bold text-foreground text-xs">{supplier.phone}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center justify-end gap-1.5"><FaEnvelope className="text-[8px]" /> Digital Node</p>
                                                <p className="font-bold text-foreground text-[11px] truncate">{supplier.email || 'N/A'}</p>
                                            </div>
                                            <div className="col-span-2 space-y-1 pt-2 border-t border-border/10">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-50 flex items-center gap-2">
                                                    <FaMapMarkerAlt className="text-[8px]" /> Physical Fulfillment Node
                                                </p>
                                                <p className="text-xs font-bold text-foreground opacity-80 leading-relaxed truncate">
                                                    {supplier.address || 'NODATA_LOCATION_MISSING'}
                                                </p>
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

            {/* System Dialogs */}
            {deleteDialogOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-md shadow-2xl border-destructive/20 bg-card/95 rounded-[2rem] overflow-hidden">
                        <CardHeader className="bg-destructive/10 p-6 text-center border-b border-destructive/10">
                            <FaTrash className="mx-auto text-3xl text-destructive mb-3" />
                            <CardTitle className="text-xl font-black uppercase tracking-tight text-destructive">Node Decommissioning</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 text-center space-y-4">
                            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                You are about to purge provider node <span className="font-black text-foreground">"{supplierToDelete?.name}"</span> from the logistics matrix. This action is final and irreversible.
                            </p>
                            <div className="flex flex-col gap-3 pt-4">
                                <Button variant="destructive" onClick={handleDeleteConfirm} className="h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-destructive/20 active:scale-95">
                                    Finalize Deletion
                                </Button>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="h-14 font-black uppercase tracking-widest rounded-2xl border-border/50 active:scale-95">
                                    Abort Command
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SupplierList;
