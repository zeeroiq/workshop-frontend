import React, { useState, useEffect } from 'react';
import {
    FaEdit,
    FaTrash,
    FaEye,
    FaPlus,
    FaSearch,
    FaUser,
    // FaEnvelope,
    // FaPhone,
    FaEllipsisV
} from 'react-icons/fa';
import { inventoryService } from '../../../services/inventoryService';
import './../../../styles/inventory/supplier/SupplierList.css';

const SupplierList = ({ onViewDetails, onEdit, onCreate }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            const response = await inventoryService.getSuppliers();

            if (response.data.success) {
                setSuppliers(response.data.data.content || response.data.data);
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
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
        } catch (error) {
            console.error('Error deleting supplier:', error);
        }
    };

    const toggleRowExpansion = (id) => {
        if (expandedRow === id) {
            setExpandedRow(null);
        } else {
            setExpandedRow(id);
        }
    };

    const getStatusBadge = (status) => {
        return (
            <span className={`status-badge ${status === 'ACTIVE' ? 'active' : 'inactive'}`}>
        {status === 'ACTIVE' ? 'Active' : 'Inactive'}
      </span>
        );
    };

    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Loading suppliers...</div>;
    }

    return (
        <div className="supplier-list-container">
            <div className="supplier-list-header">
                <div className="header-content">
                    <h2>Suppliers</h2>
                    <p>Manage your supplier information</p>
                </div>
                <button className="create-button" onClick={onCreate}>
                    <FaPlus /> Add Supplier
                </button>
            </div>

            <div className="search-section">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            <div className="suppliers-table-container">
                <table className="suppliers-table">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th className="actions-header">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredSuppliers.map((supplier) => (
                        <React.Fragment key={supplier.id}>
                            <tr className="supplier-row">
                                <td className="supplier-name">
                                    <div>
                                        <div className="name">{supplier.name}</div>
                                        <div className="email">{supplier.email}</div>
                                    </div>
                                </td>
                                <td className="contact-info">
                                    <div className="contact-person">{supplier.contactPerson}</div>
                                    <div className="phone">{supplier.phone}</div>
                                </td>
                                <td>
                                    {getStatusBadge(supplier.status)}
                                </td>
                                <td className="actions">
                                    <div className="action-buttons">
                                        <button
                                            className="btn-more"
                                            onClick={() => toggleRowExpansion(supplier.id)}
                                            title="More actions"
                                        >
                                            <FaEllipsisV />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {expandedRow === supplier.id && (
                                <tr className="expanded-row">
                                    <td colSpan="4">
                                        <div className="expanded-content">
                                            <div className="supplier-details">
                                                <div className="detail-group">
                                                    <h4>Address</h4>
                                                    <p>{supplier.address}</p>
                                                </div>
                                                <div className="detail-group">
                                                    <h4>Payment Terms</h4>
                                                    <p>{supplier.paymentTerms}</p>
                                                </div>
                                                {supplier.notes && (
                                                    <div className="detail-group">
                                                        <h4>Notes</h4>
                                                        <p>{supplier.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="expanded-actions">
                                                <button
                                                    className="btn-view"
                                                    onClick={() => onViewDetails(supplier)}
                                                >
                                                    <FaEye /> View Details
                                                </button>
                                                <button
                                                    className="btn-edit"
                                                    onClick={() => onEdit(supplier)}
                                                >
                                                    <FaEdit /> Edit
                                                </button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteClick(supplier)}
                                                >
                                                    <FaTrash /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                    </tbody>
                </table>

                {filteredSuppliers.length === 0 && (
                    <div className="no-suppliers">
                        <div className="no-suppliers-content">
                            <FaUser className="no-suppliers-icon" />
                            <h3>No suppliers found</h3>
                            <p>Try adjusting your search or add a new supplier</p>
                            <button className="create-button" onClick={onCreate}>
                                <FaPlus /> Add Supplier
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {deleteDialogOpen && (
                <div className="dialog-overlay">
                    <div className="delete-dialog">
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete supplier "{supplierToDelete?.name}"?</p>
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

export default SupplierList;