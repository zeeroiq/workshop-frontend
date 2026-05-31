import React, { useState, useEffect, useMemo } from 'react';
import { FaEdit, FaTrash, FaEye, FaPlus, FaExclamationTriangle, FaFilter, FaBarcode, FaBoxes, FaTags } from 'react-icons/fa';
import { inventoryService } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import PartScannerModal from './PartScannerModal';
import { Button } from '@/components/ui/button'; import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PartsDataTable from './PartsDataTable';
import ResponsiveActions from "@/components/common/ResponsiveActions";
import { cn } from "@/lib/utils";

const PartList = ({ onViewDetails, onEdit, onCreate }) => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [partToDelete, setPartToDelete] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadParts();
    }, []);

    const loadParts = async () => {
        try {
            setLoading(true);
            const response = await inventoryService.getParts({ page: 0, size: 1000 });
            setParts(response.data.content || []);
        } catch (error) {
            console.error('Error loading parts:', error);
            toast.error('Failed to load parts.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (part) => {
        setPartToDelete(part);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await inventoryService.deletePart(partToDelete.id);
            setDeleteDialogOpen(false);
            setPartToDelete(null);
            toast.success('Part purged from inventory.');
            loadParts();
        } catch (error) {
            toast.error('Failed to delete part.');
        }
    };

    const handlePartAction = ({ type, data }) => {
        if (type === 'edit') onEdit(data);
        else if (type === 'add') onCreate(data);
    };

    const getStatusText = (quantity, minQuantity) => {
        if (quantity === 0) return 'OUT_OF_STOCK';
        if (quantity <= minQuantity) return 'LOW_STOCK';
        return 'IN_STOCK';
    };

    const getPartActions = (part) => [
        {
            label: "Inspect Resource",
            icon: <FaEye className="text-xs" />,
            onClick: () => onViewDetails(part),
            variant: "outline"
        },
        {
            label: "Update Specs",
            icon: <FaEdit className="text-xs" />,
            onClick: () => onEdit(part),
            variant: "outline"
        },
        {
            label: "Purge Asset",
            icon: <FaTrash className="text-xs" />,
            onClick: () => handleDeleteClick(part),
            variant: "destructive"
        }
    ];

    const columns = useMemo(() => [
        {
            accessorKey: 'partNumber',
            header: 'Resource ID',
            cell: ({ row }) => <span className="font-mono text-[10px] font-black tracking-widest uppercase">{row.original.partNumber}</span>,
            enableSorting: true,
        },
        {
            accessorKey: 'name',
            header: 'Label',
            cell: ({ row }) => <span className="font-bold text-foreground text-xs uppercase tracking-tight">{row.original.name}</span>,
            enableSorting: true,
        },
        {
            accessorKey: 'category',
            header: 'Classification',
            cell: ({ row }) => <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter opacity-70">{row.original.category || 'GENERAL'}</Badge>,
            enableSorting: true,
        },
        {
            accessorKey: 'quantityInStock',
            header: 'Density',
            cell: ({ row }) => {
                const isLow = row.original.quantityInStock <= row.original.minStockLevel;
                return (
                    <span className={cn("font-black text-xs tabular-nums", isLow ? "text-red-500" : "text-emerald-500")}>
                        {row.original.quantityInStock}
                    </span>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: 'mrp',
            header: 'MRP',
            cell: ({ row }) => <span className="font-bold text-xs opacity-70">₹{row.original.mrp?.toFixed(2)}</span>,
            enableSorting: true,
        },
        {
            id: 'actions',
            header: 'System Controls',
            cell: ({ row }) => <ResponsiveActions actions={getPartActions(row.original)} />,
        },
    ], [onViewDetails, onEdit]);

    const filteredParts = useMemo(() => parts.filter(part => {
        const status = getStatusText(part.quantityInStock, part.minStockLevel);
        if (statusFilter !== 'all' && status !== statusFilter) return false;
        return true;
    }), [parts, statusFilter]);

    if (loading && parts.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary shadow-lg"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-screen-2xl mx-auto">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h3 className="text-3xl md:text-4xl font-black text-foreground tracking-tight uppercase leading-none text-center lg:text-left">Resource Node: Inventory</h3>
                    <p className="text-sm md:text-base text-muted-foreground font-medium opacity-70 text-center lg:text-left">Managing node for workshop parts and hardware logistics.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <PartScannerModal onPartAction={handlePartAction} />
                    <Button className="h-12 px-8 font-black uppercase tracking-widest text-xs shadow-xl active:scale-95" onClick={onCreate}>
                        <FaPlus className="mr-2" /> Initialize Resource
                    </Button>
                </div>
            </div>

            <Card className="border-border/50 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50 p-6">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-11 w-full md:w-[260px] bg-background/50 border-border/50 font-black uppercase tracking-widest text-[10px]">
                                <div className="flex items-center gap-2">
                                    <FaFilter className="opacity-50" />
                                    <SelectValue placeholder="Logistics State" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-card/95 backdrop-blur-xl border-border/50">
                                <SelectItem value="all" className="font-bold uppercase tracking-widest text-[10px]">GLOBAL_FLEET_STATE</SelectItem>
                                <SelectItem value="IN_STOCK" className="font-bold uppercase tracking-widest text-[10px]">OPTIMAL_DENSITY</SelectItem>
                                <SelectItem value="LOW_STOCK" className="font-bold uppercase tracking-widest text-[10px]">CRITICAL_DEPLETION</SelectItem>
                                <SelectItem value="OUT_OF_STOCK" className="font-bold uppercase tracking-widest text-[10px]">NODE_EMPTY</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-4 sm:p-8">
                        <PartsDataTable columns={columns} data={filteredParts} />
                    </div>
                </CardContent>
            </Card>

            {/* Decommissioning Dialog */}
            {deleteDialogOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-300">
                    <Card className="w-full max-w-md shadow-2xl border-destructive/20 bg-card/95 rounded-[2rem] overflow-hidden">
                        <CardHeader className="bg-destructive/10 p-6 text-center border-b border-destructive/10">
                            <FaTrash className="mx-auto text-3xl text-destructive mb-3" />
                            <CardTitle className="text-xl font-black uppercase tracking-tight text-destructive">Asset Purge Command</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 text-center space-y-4">
                            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                You are about to purge resource node <span className="font-black text-foreground">"{partToDelete?.name}"</span> from the inventory matrix. This action is terminal.
                            </p>
                            <div className="flex flex-col gap-3 pt-4">
                                <Button variant="destructive" onClick={handleDeleteConfirm} className="h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-destructive/20 active:scale-95">
                                    Finalize Purge
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

export default PartList;
