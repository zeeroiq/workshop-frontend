import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaEllipsisV, FaFilter, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { inventoryService } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PaginationComponent from "@/components/common/PaginationComponent";

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
            if (searchTerm) {
                params.search = searchTerm;
            }
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const response = await inventoryService.getSuppliers(params);
            if (response?.data?.success && response.data) {
                setSuppliers(response.data.content || []);
                setTotalPages(response.data.totalPages || 0);
            } else {
                setSuppliers([]);
                setTotalPages(0);
                toast.warn('Failed to load suppliers.');
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

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
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
            console.error('Error deleting supplier:', error);
            toast.error('Failed to delete supplier.');
        }
    };

    const toggleRowExpansion = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const STATUS_CLASSES = {
        ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        INACTIVE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        SUSPENDED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        DELETED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    };

    const humanizeStatus = (s) => (s || '')
        .toLowerCase()
        .replaceAll('_', ' ')
        .replaceAll(/\b\w/g, (ch) => ch.toUpperCase()) || 'Unknown';

    const getStatusBadge = (status) => {
        const key = (status || '').toUpperCase();
        const statusClass = STATUS_CLASSES[key] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                {humanizeStatus(key)}
            </span>
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading suppliers...</div>;
    }

    return (
        <div className="bg-card p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-semibold">Suppliers</h2>
                    <p className="text-muted-foreground">Manage your supplier information</p>
                </div>
                <Button className="w-full sm:w-auto" onClick={onCreate}>
                    <FaPlus className="mr-2" /> Add Supplier
                </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="relative w-full md:w-1/2">
                    <FaSearch className="absolute top-3 left-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
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
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="DELETED">Deleted</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto rounded-md border border-border/50">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Name</th>
                            <th className="px-6 py-4 font-semibold">Contact</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {suppliers.map((supplier) => (
                            <React.Fragment key={supplier.id}>
                                <tr className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-primary">{supplier.name}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <FaEnvelope className="text-[10px]" /> {supplier.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{supplier.contactPerson}</div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <FaPhone className="text-[10px]" /> {supplier.phone}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(supplier.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" onClick={() => toggleRowExpansion(supplier.id)}>
                                            <FaEllipsisV />
                                        </Button>
                                    </td>
                                </tr>
                                {expandedRow === supplier.id && (
                                    <tr className="bg-muted/10">
                                        <td colSpan="4" className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="space-y-2">
                                                    <h4 className="text-xs uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-2">
                                                        <FaMapMarkerAlt /> Address
                                                    </h4>
                                                    <p className="text-sm">{supplier.address || 'No address provided'}</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Payment Terms</h4>
                                                    <p className="text-sm">{supplier.paymentTerm || 'Standard'}</p>
                                                </div>
                                                {supplier.notes && (
                                                    <div className="space-y-2">
                                                        <h4 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Notes</h4>
                                                        <p className="text-sm italic text-muted-foreground">{supplier.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/50">
                                                <Button variant="outline" size="sm" onClick={() => onViewDetails(supplier)}>
                                                    <FaEye className="mr-2" /> View Details
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => onEdit(supplier)} className="text-blue-500 hover:text-blue-600">
                                                    <FaEdit className="mr-2" /> Edit
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleDeleteClick(supplier)} className="text-destructive hover:text-destructive/90">
                                                    <FaTrash className="mr-2" /> Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile/Tablet View */}
            <div className="lg:hidden space-y-4">
                {suppliers.length === 0 ? (
                    <div className="text-center py-16 bg-muted/20 rounded-lg">
                        <h3 className="text-lg font-semibold">No suppliers found</h3>
                        <p className="text-muted-foreground mb-4">Try adjusting your search or add a new supplier.</p>
                        <Button onClick={onCreate}>
                            <FaPlus className="mr-2" /> Add Supplier
                        </Button>
                    </div>
                ) : (
                    suppliers.map((supplier) => (
                        <Card key={supplier.id} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-bold">{supplier.name}</CardTitle>
                                        <p className="text-sm text-primary font-medium">{supplier.contactPerson}</p>
                                    </div>
                                    {getStatusBadge(supplier.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Phone</p>
                                        <p className="font-medium flex items-center gap-2">
                                            <FaPhone className="text-[10px]" /> {supplier.phone}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Email</p>
                                        <p className="font-medium flex items-center gap-2 truncate">
                                            <FaEnvelope className="text-[10px]" /> {supplier.email}
                                        </p>
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Address</p>
                                        <p className="font-medium line-clamp-2">{supplier.address || '-'}</p>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-border/50">
                                    <Button variant="outline" size="sm" onClick={() => onViewDetails(supplier)} className="flex-1 min-w-[80px]">
                                        <FaEye className="mr-2" /> View
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => onEdit(supplier)} className="flex-1 min-w-[80px] text-blue-500">
                                        <FaEdit className="mr-2" /> Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(supplier)} className="flex-1 min-w-[80px]">
                                        <FaTrash className="mr-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
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

            {deleteDialogOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2">
                                <FaTrash className="text-lg" /> Confirm Delete
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Are you sure you want to delete supplier <span className="font-bold text-foreground">"{supplierToDelete?.name}"</span>? This action cannot be undone.</p>
                            <div className="flex justify-end mt-8 gap-3">
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteConfirm}>
                                    Delete Supplier
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
