import React, {useState, useEffect} from 'react';
import {
    FaEdit,
    FaTrash,
    FaEye,
    FaPlus,
    FaSearch,
    FaExclamationTriangle
} from 'react-icons/fa';
import {inventoryService} from '../../../services/inventoryService';
import '../../../styles/inventory/part/PartList.css';

const PartList = ({onViewDetails, onEdit, onCreate}) => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [partToDelete, setPartToDelete] = useState(null);

    useEffect(() => {
        loadParts();
    }, []);

    const loadParts = async () => {
        try {
            setLoading(true);
            const response = await inventoryService.getParts();
            setParts(response.data.data.content);
        } catch (error) {
            console.error('Error loading parts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
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
        } catch (error) {
            console.error('Error deleting part:', error);
        }
    };

    const getStatusColor = (quantity, minQuantity) => {
        if (quantity === 0) return 'out-of-stock';
        if (quantity <= minQuantity) return 'low-stock';
        return 'in-stock';
    };

    const getStatusText = (quantity, minQuantity) => {
        if (quantity === 0) return 'Out of Stock';
        if (quantity <= minQuantity) return 'Low Stock';
        return 'In Stock';
    };

    const filteredParts = parts.filter(part =>
        part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Loading parts...</div>;
    }

    return (
        <div className="part-list-container">
            <div className="part-list-header">
                <h3>Parts Inventory</h3>
                <button className="create-button" onClick={onCreate}>
                    <FaPlus/> Add Part
                </button>
            </div>

            <div className="search-box">
                <FaSearch className="search-icon"/>
                <input
                    type="text"
                    placeholder="Search parts by name, SKU, or description..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            <div className="parts-table-container">
                <table className="parts-table">
                    <thead>
                    <tr>
                        {/*<th>SKU</th>*/}
                        <th>Name</th>
                        <th>Category</th>
                        <th>In Stock</th>
                        <th>Unit Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredParts.map((part) => (
                        <tr key={part.id}>
                            {/*<td className="sku">{part.sku}</td>*/}
                            <td className="name">{part.name}</td>
                            <td className="category">{part.category}</td>
                            <td className="quantity">{part.quantityInStock} {part.unitType}</td>
                            <td className="price">&#x20B9;{part.sellingPrice?.toFixed(2)}</td>
                            <td>
                  <span className={`status-badge ${getStatusColor(part.quantityInStock, part.minStockLevel)}`}>
                    {getStatusText(part.quantityInStock, part.minStockLevel)}
                      {part.quantityInStock <= part.minStockLevel && <FaExclamationTriangle className="warning-icon"/>}
                  </span>
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button className="btn-view" onClick={() => onViewDetails(part)}>
                                        <FaEye/>
                                    </button>
                                    <button className="btn-edit" onClick={() => onEdit(part)}>
                                        <FaEdit/>
                                    </button>
                                    <button className="btn-delete" onClick={() => handleDeleteClick(part)}>
                                        <FaTrash/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {filteredParts.length === 0 && (
                    <div className="no-parts">
                        <p>No parts found matching your criteria</p>
                    </div>
                )}
            </div>

            {deleteDialogOpen && (
                <div className="dialog-overlay">
                    <div className="delete-dialog">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete part "{partToDelete?.name}"?</p>
                        <div className="dialog-actions">
                            <button className="btn-cancel" onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </button>
                            <button className="btn-confirm" onClick={handleDeleteConfirm}>
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