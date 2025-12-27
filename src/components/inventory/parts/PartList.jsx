import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaPlus, FaSearch, FaExclamationTriangle, FaFilter, FaUpload } from 'react-icons/fa';
import { inventoryService } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import PaginationComponent from "@/components/common/PaginationComponent";

const PartList = ({ onViewDetails, onEdit, onCreate }) => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [partToDelete, setPartToDelete] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadParts();
    }, [currentPage, searchTerm, statusFilter]);

    const loadParts = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                size: 10,
            };
            if (searchTerm) {
                params.search = searchTerm;
            }
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }
            const response = await inventoryService.getParts(params);
            setParts(response.data.data.content || []);
            console.log('Loaded parts:', response.data.data);
            setTotalPages(response.data.data.totalPages || 1);
        } catch (error) {
            console.error('Error loading parts:', error);
            toast.error('Failed to load parts.');
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

    const handleDeleteClick = (part) => {
        setPartToDelete(part);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await inventoryService.deletePart(partToDelete.id);
            setParts(parts.filter(part => part.id !== partToDelete.id));
            setDeleteDialogOpen(false);
            setPartToDelete(null);
            toast.success('Part deleted successfully.');
            loadParts(); // Refresh the list
        } catch (error) {
            console.error('Error deleting part:', error);
            toast.error('Failed to delete part.');
        }
    };

    const getStatusColor = (quantity, minQuantity) => {
        if (quantity === 0) return 'bg-red-100 text-red-800';
        if (quantity <= minQuantity) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const getStatusText = (quantity, minQuantity) => {
        if (quantity === 0) return 'Out of Stock';
        if (quantity <= minQuantity) return 'Low Stock';
        return 'In Stock';
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading parts...</div>;
    }

    return (
        <div className="bg-card p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Parts Inventory</h3>
                <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md flex items-center" onClick={onCreate}>
                    <FaPlus className="mr-2" /> Add Part
                </button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="relative w-full md:w-1/2">
                    <FaSearch className="absolute top-3 left-3 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search parts by name or SKU..."
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
                        <option value="IN_STOCK">In Stock</option>
                        <option value="LOW_STOCK">Low Stock</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Part No.</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">In Stock</th>
                            <th className="px-6 py-3">Unit Price</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Location</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            parts.map((part) => (
                            <tr key={part.id} className="border-b border-border hover:bg-muted/50">
                                <td className="px-6 py-4 font-medium">{part.name}</td>
                                <td className="px-6 py-4">{part.partNumber}</td>
                                <td className="px-6 py-4">{part.category}</td>
                                <td className="px-6 py-4">{part.quantityInStock} {part.unitType}</td>
                                <td className="px-6 py-4">₹{part.sellingPrice?.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(part.quantityInStock, part.minStockLevel)}`}>
                                        {getStatusText(part.quantityInStock, part.minStockLevel)}
                                        {part.quantityInStock <= part.minStockLevel && <FaExclamationTriangle className="inline-block ml-1" />}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{part.location}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <button className="text-primary hover:text-primary/80" onClick={() => onViewDetails(part)}>
                                            <FaEye />
                                        </button>
                                        <button className="text-blue-500 hover:text-blue-700" onClick={() => onEdit(part)}>
                                            <FaEdit />
                                        </button>
                                        <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteClick(part)}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            ))
                        }
                    </tbody>
                </table>

                {
                    parts.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">No parts found</p>
                    </div>
                    )
                }
            </div>

            {
                totalPages > 1 && (
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                )
            }

            {deleteDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-card p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p>Are you sure you want to delete part "{partToDelete?.name}"?</p>
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

export default PartList;
