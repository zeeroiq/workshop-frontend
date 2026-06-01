import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash, Eye, Plus, Search, Filter, AlertTriangle, Package } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import PartScannerModal from './PartScannerModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';

const PartList = ({ onViewDetails, onEdit, onCreate }) => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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

    const handleDelete = async (part) => {
        if (!window.confirm(`Are you sure you want to delete part "${part.name}"?`)) {
            return;
        }

        try {
            await inventoryService.deletePart(part.id);
            setParts(parts.filter(p => p.id !== part.id));
            toast.success('Part deleted successfully.');
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

    const filteredParts = useMemo(() => {
        return parts.filter(part => {
            const matchesSearch = 
                part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                part.category?.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (statusFilter === 'all') return matchesSearch;
            
            const status = part.quantityInStock === 0 ? 'OUT_OF_STOCK' : 
                          part.quantityInStock <= part.minStockLevel ? 'LOW_STOCK' : 'IN_STOCK';
            
            return matchesSearch && status === statusFilter;
        });
    }, [parts, searchTerm, statusFilter]);

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
            cell: (row) => <Badge variant="outline" className="bg-muted/30 border-border/50">{row.category}</Badge>
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
                                <Badge variant={info.color === 'success' ? 'secondary' : info.color === 'warning' ? 'warning' : 'destructive'} className="text-[10px] h-5">
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
            cell: (row) => <span className="font-medium text-emerald-500">₹{row.mrp?.toFixed(2)}</span>
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (row, isTablet) => (
                <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" onClick={() => onViewDetails(row)}>
                        <Eye className="h-4 w-4 text-emerald-500" />
                        {!isTablet && <span className="ml-2">View</span>}
                    </Button>
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2" onClick={() => onEdit(row)}>
                        <Edit className="h-4 w-4 text-primary" />
                        {!isTablet && <span className="ml-2 text-primary">Edit</span>}
                    </Button>
                    <Button variant="ghost" size={isTablet ? "icon" : "sm"} className="h-8 w-auto px-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => {
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
                    <Badge variant={statusInfo.color === 'success' ? 'secondary' : statusInfo.color === 'warning' ? 'warning' : 'destructive'}>
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
                            <p className="font-medium mt-1 text-emerald-500">₹{part.mrp?.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Category</p>
                            <Badge variant="outline" className="mt-1">{part.category}</Badge>
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
                            className="flex-1 h-11 gap-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-none"
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
        <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search parts by name, number or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-muted/30 border-border/50"
                />
            </div>
            <div className="flex gap-2">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-muted/30 border border-border/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                    <option value="all">All Statuses</option>
                    <option value="IN_STOCK">In Stock</option>
                    <option value="LOW_STOCK">Low Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
                <Button variant="outline" className="border-border/50 gap-2">
                    <Filter size={16} />
                    <span className="hidden sm:inline">More Filters</span>
                </Button>
            </div>
        </div>
    );

    const actions = (
        <div className="flex items-center gap-2">
            <PartScannerModal onPartAction={({type, data}) => type === 'edit' ? onEdit(data) : onCreate(data)} />
            <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 gap-2">
                <Plus size={16} />
                <span className="hidden sm:inline">Add Part</span>
            </Button>
        </div>
    );

    return (
        <div className="pb-6">
            <ResponsiveDataContainer
                title="Parts Inventory"
                description="Manage your workshop spare parts and stock levels"
                actions={actions}
                filters={filters}
                columns={columns}
                data={filteredParts}
                renderCard={renderPartCard}
                onRowClick={onViewDetails}
                loading={loading}
                emptyMessage="No parts found in inventory. Click 'Add Part' to stock new items."
            />
        </div>
    );
};

export default PartList;
