import React, { useState, useEffect, useMemo } from 'react';
import { FaEdit, FaTrash, FaEye, FaPlus, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import { inventoryService } from '@/services/inventoryService';
import { toast } from 'react-toastify';
import PartScannerModal from './PartScannerModal';
import { Button } from '@/components/ui/button';
import PartsDataTable from './PartsDataTable';

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
            const response = await inventoryService.getParts({ page: 0, size: 1000 }); // Fetch all parts
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

    const handlePartAction = ({ type, data }) => {
        if (type === 'edit') {
            onEdit(data);
        } else if (type === 'add') {
            onCreate(data);
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

    const columns = useMemo(() => [
        {
            accessorKey: 'partNumber',
            header: 'Part Number',
            enableSorting: true,
        },
        {
            accessorKey: 'name',
            header: 'Name',
            enableSorting: true,
        },
        {
            accessorKey: 'category',
            header: 'Category',
            enableSorting: true,
        },
        {
            accessorKey: 'quantityInStock',
            header: 'In Stock',
            cell: ({ row }) => `${row.original.quantityInStock}`,
            enableSorting: true,
        },
        {
            accessorKey: 'costPrice',
            header: 'Unit Price',
            cell: ({ row }) => `₹${row.original.costPrice?.toFixed(2)}`,
            enableSorting: true,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const { quantityInStock, minStockLevel } = row.original;
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quantityInStock, minStockLevel)}`}>
                        {getStatusText(quantityInStock, minStockLevel)}
                        {quantityInStock <= minStockLevel && <FaExclamationTriangle className="inline-block ml-1" />}
                    </span>
                );
            },
            enableSorting: true,
        },
        {
            accessorKey: 'location',
            header: 'Location',
            enableSorting: true,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const part = row.original;
                return (
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
                );
            },
        },
    ], [onViewDetails, onEdit]);

    const filteredParts = useMemo(() => parts.filter(part => {
        const status = getStatusText(part.quantityInStock, part.minStockLevel).replace(' ', '_').toUpperCase();
        if (statusFilter !== 'all' && status !== statusFilter) {
            return false;
        }
        return true;
    }), [parts, statusFilter]);

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading parts...</div>;
    }

    return (
        <div className="bg-card p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Parts Inventory</h3>
                <div className="flex space-x-2">
                    <PartScannerModal onPartAction={handlePartAction} />
                    <Button className="text-md font-medium" variant="default" size="lg" onClick={onCreate}>
                        <FaPlus className="mr-2" /> Add Part
                    </Button>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <div className="relative">
                    <FaFilter className="absolute top-3 left-3 text-muted-foreground" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-input pl-10 pr-4 py-2 rounded-md appearance-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="IN_STOCK">In Stock</option>
                        <option value="LOW_STOCK">Low Stock</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                    </select>
                </div>
            </div>

            <PartsDataTable
                columns={columns}
                data={filteredParts}
            />

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
