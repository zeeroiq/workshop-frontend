import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash, Eye, Plus, Search, Filter, Phone, Mail, User } from 'lucide-react';
import { inventoryService } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaginationComponent from "@/components/common/PaginationComponent";
import ResponsiveDataContainer from '@/components/common/layout/ResponsiveDataContainer';

const SupplierList = ({ onViewDetails, onEdit, onCreate }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadSuppliers();
    }, [currentPage, searchTerm, statusFilter]);

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                size: 10,
                sort: 'name,asc',
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter !== 'all' && { status: statusFilter })
            };
            const response = await inventoryService.getSuppliers(params);
            if (response?.data?.success) {
                setSuppliers(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
            toast.error('Failed to load suppliers.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (supplier) => {
        if (!window.confirm(`Are you sure you want to delete supplier "${supplier.name}"?`)) {
            return;
        }

        try {
            await inventoryService.deleteSupplier(supplier.id);
            toast.success('Supplier deleted successfully.');
            loadSuppliers();
        } catch (error) {
            console.error('Error deleting supplier:', error);
            toast.error('Failed to delete supplier.');
        }
    };

    const getStatusBadge = (status) => {
        const variant = status === 'ACTIVE' ? 'success' : status === 'INACTIVE' ? 'destructive' : 'secondary';
        return (
            <Badge variant={variant} className="text-[10px] uppercase tracking-wider">
                {status || 'UNKNOWN'}
            </Badge>
        );
    };

    const columns = [
        {
            header: "Supplier Name",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{row.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{row.email || '-'}</span>
                </div>
            )
        },
        {
            header: "Contact Person",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <User size={14} className="text-emerald-500" />
                    <span className="text-sm">{row.contactPerson || '-'}</span>
                </div>
            )
        },
        {
            header: "Phone",
            accessor: "phone",
            cell: (row) => <span className="text-muted-foreground">{row.phone || '-'}</span>
        },
        {
            header: "Status",
            cell: (row) => getStatusBadge(row.status)
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

    const renderSupplierCard = (supplier) => (
        <Card 
            className="overflow-hidden border-border/50 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => onViewDetails(supplier)}
        >
            <CardHeader className="pb-3 bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg group-hover:text-emerald-500 transition-colors">
                    {supplier.name}
                </CardTitle>
                {getStatusBadge(supplier.status)}
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Contact</p>
                        <p className="font-medium mt-1 truncate">{supplier.contactPerson || '-'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Phone</p>
                        <p className="font-medium mt-1">{supplier.phone || '-'}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Email</p>
                        <p className="font-medium mt-1 truncate">{supplier.email || '-'}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                    <Button variant="outline" className="flex-1 h-11 gap-2 border-border/50" onClick={(e) => { e.stopPropagation(); onEdit(supplier); }}>
                        <Edit size={16} />
                        <span>Edit</span>
                    </Button>
                    <Button variant="destructive" className="flex-1 h-11 gap-2 bg-destructive/10 text-destructive border-none" onClick={(e) => { e.stopPropagation(); handleDelete(supplier); }}>
                        <Trash size={16} />
                        <span>Delete</span>
                    </Button>
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
                    placeholder="Search by name, contact or email..."
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
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
            </select>
        </div>
    );

    const actions = (
        <Button onClick={onCreate} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 gap-2">
            <Plus size={16} />
            <span>Add Supplier</span>
        </Button>
    );

    return (
        <div className="pb-6">
            <ResponsiveDataContainer
                title="Suppliers"
                description="Manage your vendor partnerships and contact details"
                actions={actions}
                filters={filters}
                columns={columns}
                data={suppliers}
                renderCard={renderSupplierCard}
                onRowClick={onViewDetails}
                loading={loading}
                emptyMessage="No suppliers found."
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

export default SupplierList;
