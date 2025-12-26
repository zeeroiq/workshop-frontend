import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaEllipsisV, FaFilter } from 'react-icons/fa';
import { inventoryService } from '@/services/inventoryService';
import { toast } from 'react-toastify';
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
            if (response?.data?.success && response.data.data) {
                setSuppliers(response.data.data.content || []);
                setTotalPages(response.data.data.totalPages || 0);
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
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-semibold">Suppliers</h2>
                    <p className="text-muted-foreground">Manage your supplier information</p>
                </div>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center" onClick={onCreate}>
                    <FaPlus className="mr-2" /> Add Supplier
                </button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full md:w-1/2">
                    <FaSearch className="absolute top-3 left-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-input pl-10 pr-4 py-2 rounded-md w-full"
                    />
                </div>
                <div className="relative">
                    <FaFilter className="absolute top-3 left-3 text-muted-foreground" />
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="bg-input pl-10 pr-4 py-2 rounded-md appearance-none"
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

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Contact</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.map((supplier) => (
                            <React.Fragment key={supplier.id}>
                                <tr className="border-b border-border hover:bg-muted/50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{supplier.name}</div>
                                        <div className="text-muted-foreground">{supplier.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>{supplier.contactPerson}</div>
                                        <div className="text-muted-foreground">{supplier.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(supplier.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-muted-foreground hover:text-primary" onClick={() => toggleRowExpansion(supplier.id)}>
                                            <FaEllipsisV />
                                        </button>
                                    </td>
                                </tr>
                                {expandedRow === supplier.id && (
                                    <tr className="bg-muted/20">
                                        <td colSpan="4" className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <h4 className="font-semibold">Address</h4>
                                                    <p>{supplier.address}</p>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">Payment Terms</h4>
                                                    <p>{supplier.paymentTerm}</p>
                                                </div>
                                                {supplier.notes && (
                                                    <div>
                                                        <h4 className="font-semibold">Notes</h4>
                                                        <p>{supplier.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-end space-x-2 mt-4">
                                                <button className="text-primary hover:text-primary/80 flex items-center" onClick={() => onViewDetails(supplier)}>
                                                    <FaEye className="mr-1" /> View
                                                </button>
                                                <button className="text-blue-500 hover:text-blue-700 flex items-center" onClick={() => onEdit(supplier)}>
                                                    <FaEdit className="mr-1" /> Edit
                                                </button>
                                                <button className="text-red-500 hover:text-red-700 flex items-center" onClick={() => handleDeleteClick(supplier)}>
                                                    <FaTrash className="mr-1" /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>

                {suppliers.length === 0 && (
                    <div className="text-center py-16">
                        <h3 className="text-lg font-semibold">No suppliers found</h3>
                        <p className="text-muted-foreground mb-4">Try adjusting your search or add a new supplier.</p>
                        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center mx-auto" onClick={onCreate}>
                            <FaPlus className="mr-2" /> Add Supplier
                        </button>
                    </div>
                )}
            </div>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p>Are you sure you want to delete supplier "{supplierToDelete?.name}"?</p>
                        <div className="flex justify-end mt-6 space-x-4">
                            <button className="bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-md" onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </button>
                            <button className="bg-destructive text-destructive-foreground hover:bg-destructive/80 px-4 py-2 rounded-md" onClick={handleDeleteConfirm}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierList;
