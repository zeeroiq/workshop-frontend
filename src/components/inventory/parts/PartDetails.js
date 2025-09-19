import React from 'react';
import {
    FaArrowLeft,
    FaEdit,
    FaBox,
    FaTag,
    FaIndustry,
    FaRupeeSign,
    FaMapMarkerAlt,
    FaUserTie,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaFileAlt
} from 'react-icons/fa';
import './../../../styles/PartDetails.css';

const PartDetails = ({part, onBack, onEdit}) => {
    const getStatusColor = (quantity, minStockLevel) => {
        if (quantity === 0) return 'out-of-stock';
        if (quantity <= minStockLevel) return 'low-stock';
        return 'in-stock';
    };

    const getStatusText = (quantity, minStockLevel) => {
        if (quantity === 0) return 'Out of Stock';
        if (quantity <= minStockLevel) return 'Low Stock';
        return 'In Stock';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!part) {
        return (
            <div className="part-details-container">
                <div className="part-not-found">
                    <button className="back-button" onClick={onBack}>
                        <FaArrowLeft/> Back to Parts
                    </button>
                    <h2>Part not found</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="part-details-container">
            <div className="part-details-header">
                <button className="back-button" onClick={onBack}>
                    <FaArrowLeft/> Back to Parts
                </button>
                <button className="edit-button" onClick={onEdit}>
                    <FaEdit/> Edit Part
                </button>
            </div>

            <div className="part-details-content">
                <div className="part-header">
                    <h2>{part.name}</h2>
                    <div className="part-id-status">
                        <span className="part-number">{part.partNumber}</span>
                        <span className={`status-badge ${getStatusColor(part.quantityInStock, part.minStockLevel)}`}>
                          {getStatusText(part.quantityInStock, part.minStockLevel)}
                            {part.quantityInStock <= part.minStockLevel &&
                                <FaExclamationTriangle className="warning-icon"/>}
                        </span>
                    </div>
                </div>

                <div className="details-grid">
                    <div className="detail-section">
                        <h3>Basic Information</h3>
                        <div className="detail-item">
                            <FaBox className="detail-icon"/>
                            <div>
                                <label>Name</label>
                                <p>{part.name}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <FaTag className="detail-icon"/>
                            <div>
                                <label>Part Number</label>
                                <p>{part.partNumber}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <div>
                                <label>Category</label>
                                <p>{part.category}</p>
                            </div>
                        </div>
                        {part.description && (
                            <div className="detail-item">
                                <FaFileAlt className="detail-icon"/>
                                <div>
                                    <label>Description</label>
                                    <p>{part.description}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h3>Manufacturer & Supplier</h3>
                        <div className="detail-item">
                            <FaIndustry className="detail-icon"/>
                            <div>
                                <label>Manufacturer</label>
                                <p>{part.manufacturer}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <FaUserTie className="detail-icon"/>
                            <div>
                                <label>Supplier</label>
                                <p>{part.supplierName}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <div>
                                <label>Supplier ID</label>
                                <p>{part.supplierId}</p>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Pricing & Inventory</h3>
                        <div className="detail-item">
                            <FaRupeeSign className="detail-icon"/>
                            <div>
                                <label>Cost Price</label>
                                <p>&#x20B9;{part.costPrice?.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <FaRupeeSign className="detail-icon"/>
                            <div>
                                <label>Selling Price</label>
                                <p>&#x20B9;{part.sellingPrice?.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <div>
                                <label>Current Stock</label>
                                <p>{part.quantityInStock} units</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <div>
                                <label>Minimum Stock Level</label>
                                <p>{part.minStockLevel} units</p>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Location & Dates</h3>
                        <div className="detail-item">
                            <FaMapMarkerAlt className="detail-icon"/>
                            <div>
                                <label>Location</label>
                                <p>{part.location}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <FaCalendarAlt className="detail-icon"/>
                            <div>
                                <label>Created At</label>
                                <p>{formatDate(part.createdAt)}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <FaCalendarAlt className="detail-icon"/>
                            <div>
                                <label>Last Updated</label>
                                <p>{formatDate(part.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartDetails;