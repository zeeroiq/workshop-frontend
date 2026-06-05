import React, { useState, useEffect } from 'react';
import { Edit, Trash, Eye, Plus, Search, Filter, AlertTriangle, Package } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import PartScannerModal from './PartScannerModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';
import PaginationComponent from "@/components/common/PaginationComponent";
import { cn } from "@/lib/utils";

const PartList = ({ onViewDetails, onEdit, onCreate }) => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            loadParts();
        }, searchTerm ? 500 : 0);

        return () => clearTimeout(delayDebounceFn);
    }, [currentPage, searchTerm, activeFilter]);

    const loadParts = async () => {
        try {
            setLoading(true);
            const params = { 
                page: currentPage, 
                size: 10,
                search: searchTerm,
                filter: activeFilter || undefined
            };
            
            const response = await inventoryService.getParts(params);
            
            if (response.data) {
                setParts(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Error loading parts:', error);
            toast.error('Failed to load parts.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (filterValue) => {
        if (activeFilter === filterValue) {
            setActiveFilter(''); // Toggle off
        } else {
            setActiveFilter(filterValue);
        }
        setCurrentPage(0);
    };

    const handleDelete = async (part) => {
        if (!window.confirm(`Are you sure you want to delete part "${part.name}"?`)) {
            return;
        }

        try {
            await inventoryService.deletePart(part.id);
            toast.success('Part deleted successfully.');
            loadParts();
        } catch (error) {
            console.error('Error deleting part:', error);
            toast.error('Failed to delete part.');
        }
    };

    const getStatusInfo = (quantity, minQuantity) => {
        if (quantity === 0) return { text: 'Out of Stock', color: 'destructive', icon: <AlertTriangle size={12} className="mr-1" /> };
        if (quantity <= minQuantity) return { text: 'Low Stock', color: 'warning', icon: <AlertTriangle size={12} className="mr-1" /> };
        return { text: 'In Stock', color: 'success', icon: null };
    };

    const columns = [
        {
            header: "Part Info",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{row.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{row.partNumber}</span>
                </div>
            )
        },
        {
            header: "Category",
            accessor: "category",
            cell: (row) => <Badge variant="outline" className="bg-muted/30 border-border/50 text-[10px] uppercase">{row.category}</Badge>
        },
        {
            header: "Stock",
            cell: (row) => (
                <div className="flex flex-col gap-1">
                    <span className="font-medium">{row.quantityInStock} units</span>
                    <div className="flex items-center">
                        {(() => {
                            const info = getStatusInfo(row.quantityInStock, row.minStockLevel);
                            return (
                                <Badge variant={info.color === 'success' ? 'secondary' : info.color === 'warning' ? 'warning' : 'destructive'} className="text-[9px] h-5 uppercase font-bold">
                                    {info.icon}{info.text}
                                </Badge>
                            );
                        })()}
                    </div>
                </div>
            )
        },
        {
            header: "Price",
            cell: (row) => <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{row.mrp?.toFixed(2)}</span>
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (row, isTablet) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" onClick={() => onViewDetails(row)}>
                        <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        {!isTablet && <span className="ml-2">View</span>}
                    </Button>
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" onClick={() => onEdit(row)}>
                        <Edit className="h-4 w-4 text-primary" />
                        {!isTablet && <span className="ml-2 text-primary">Edit</span>}
                    </Button>
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2 text-destructive" onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(row);
                    }}>
                        <Trash className="h-4 w-4" />
                        {!isTablet && <span className="ml-2">Delete</span>}
                    </Button>
                </div>
            )
        }
    ];

    const renderPartCard = (part) => {
        const statusInfo = getStatusInfo(part.quantityInStock, part.minStockLevel);
        return (
            <Card 
                className="overflow-hidden border-border/50 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
                onClick={() => onViewDetails(part)}
            >
                <CardHeader className="pb-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-1">
                        <CardTitle className="text-lg group-hover:text-emerald-500 transition-colors">
                            {part.name}
                        </CardTitle>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{part.partNumber}</p>
                    </div>
                    <Badge variant={statusInfo.color === 'success' ? 'secondary' : statusInfo.color === 'warning' ? 'warning' : 'destructive'} className="text-[10px] uppercase font-bold">
                        {statusInfo.text}
                    </Badge>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Stock</p>
                            <p className="font-medium mt-1">{part.quantityInStock} Units</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Price</p>
                            <p className="font-bold mt-1 text-emerald-600 dark:text-emerald-400">₹{part.mrp?.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Category</p>
                            <Badge variant="outline" className="mt-1 text-[10px] uppercase">{part.category}</Badge>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Location</p>
                            <p className="font-medium mt-1">{part.location || '-'}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                        <Button 
                            variant="outline" 
                            className="flex-1 h-11 gap-2 border-border/50"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(part);
                            }}
                        >
                            <Edit size={16} />
                            <span>Edit</span>
                        </Button>
                        <Button 
                            variant="destructive" 
                            className="flex-1 h-11 gap-2 bg-destructive/10 text-destructive border-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(part);
                            }}
                        >
                            <Trash size={16} />
                            <span>Delete</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    const filters = (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1 shrink-0">
                    <Filter size={10} /> Filters:
                </span>
                
                <Select value={activeFilter || 'ALL'} onValueChange={handleFilter}>
                    <SelectTrigger className="w-[180px] h-9 rounded-xl text-[10px] font-black uppercase tracking-widest border-border/50 bg-card/50">
                        <SelectValue placeholder="Status Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">ALL PARTS</SelectItem>
                        <SelectItem value="RECENT">RECENTLY ADDED</SelectItem>
                        <SelectItem value="in-stock">IN STOCK</SelectItem>
                        <SelectItem value="low-stock">LOW STOCK ALERT</SelectItem>
                        <SelectItem value="out-of-stock">OUT OF STOCK</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="relative group w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <Input
                    type="text"
                    placeholder="Search parts by name, number..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(0);
                    }}
                    className="pl-10 w-full h-10 bg-background/50 border-border/50 font-bold rounded-xl backdrop-blur-sm"
                />
            </div>
        </div>
    );

    const actions = (
        <div className="flex items-center gap-2">
            <PartScannerModal onPartAction={({type, data}) => type === 'edit' ? onEdit(data) : onCreate(data)} />
            <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2">
                <Plus size={16} strokeWidth={3} />
                <span className="hidden sm:inline">Add Part</span>
            </Button>
        </div>
    );

    return (
        <div className="w-full mx-auto space-y-8 pb-10 pr-10">
            <ResponsiveDataContainer
                title="Parts Inventory"
                description="Manage your workshop spare parts and stock levels"
                actions={actions}
                filters={filters}
                columns={columns}
                data={parts}
                renderCard={renderPartCard}
                onRowClick={onViewDetails}
                loading={loading && parts.length === 0}
                emptyMessage="Your parts catalog is empty. Populate your inventory to track stock levels and billing."
                emptyIcon={Package}
                emptyActionLabel="Stock New Part"
                onEmptyAction={onCreate}
            />

            {!loading && parts.length > 0 && (
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default PartList;