import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaEllipsisV, FaFilter } from 'react-icons/fa';
import { inventoryService } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import PaginationComponent from "@/components/common/PaginationComponent";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
        ACTIVE: 'bg-green-100 text-green-800',
        INACTIVE: 'bg-red-100 text-red-800',
        SUSPENDED: 'bg-orange-100 text-orange-800',
        DELETED: 'bg-brown-100 text-brown-800',
    };

    const humanizeStatus = (s) => (s || '')
        .toLowerCase()
        .replaceAll('_', ' ')
        .replaceAll(/\b\w/g, (ch) => ch.toUpperCase()) || 'Unknown';

    const getStatusBadge = (status) => {
        const key = (status || '').toUpperCase();
        const statusClass = STATUS_CLASSES[key] || 'bg-gray-100 text-gray-800';
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <h2 className="text-xl font-semibold">Suppliers</h2>
                    <p className="text-muted-foreground">Manage your supplier information</p>
                </div>
                <Button type="button" onClick={onCreate}>
                    <FaPlus className="mr-2" /> Add Supplier
                </Button>
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full lg:flex-1">
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
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
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="DELETED">Deleted</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {suppliers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="py-16 text-center text-muted-foreground">
                                <div className="flex flex-col items-center gap-3">
                                    <h3 className="text-lg font-semibold text-foreground">No suppliers found</h3>
                                    <p>Try adjusting your search or add a new supplier.</p>
                                    <Button type="button" onClick={onCreate}>
                                        <FaPlus className="mr-2" /> Add Supplier
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        suppliers.map((supplier) => (
                            <React.Fragment key={supplier.id}>
                                <TableRow>
                                    <TableCell>
                                        <div className="font-medium">{supplier.name}</div>
                                        <div className="text-muted-foreground">{supplier.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div>{supplier.contactPerson}</div>
                                        <div className="text-muted-foreground">{supplier.phone}</div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => toggleRowExpansion(supplier.id)} aria-label={`Toggle details for ${supplier.name}`}>
                                                <FaEllipsisV />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                {expandedRow === supplier.id && (
                                    <TableRow className="bg-muted/20">
                                        <TableCell colSpan={4} className="p-4">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                <div>
                                                    <h4 className="font-semibold">Address</h4>
                                                    <p className="text-muted-foreground">{supplier.address || '-'}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">Payment Terms</h4>
                                                    <p className="text-muted-foreground">{supplier.paymentTerm || '-'}</p>
                                                </div>
                                                {supplier.notes && (
                                                    <div>
                                                        <h4 className="font-semibold">Notes</h4>
                                                        <p className="text-muted-foreground">{supplier.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                                                <Button type="button" variant="outline" onClick={() => onViewDetails(supplier)}>
                                                    <FaEye className="mr-2" /> View
                                                </Button>
                                                <Button type="button" variant="outline" onClick={() => onEdit(supplier)}>
                                                    <FaEdit className="mr-2" /> Edit
                                                </Button>
                                                <Button type="button" variant="destructive" onClick={() => handleDeleteClick(supplier)}>
                                                    <FaTrash className="mr-2" /> Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))
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
            {deleteDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-[calc(100vw-2rem)] max-w-md rounded-lg bg-card p-6 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p className="text-muted-foreground">Are you sure you want to delete supplier "{supplierToDelete?.name}"?</p>
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button type="button" variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierList;
