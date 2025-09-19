import React from 'react';
import {
    FaUser,
    FaPhone,
    FaEnvelope,
    FaMapMarkerAlt,
    FaGlobe,
    FaCalendar,
    FaEdit,
    FaArrowLeft,
    FaBuilding,
    FaStickyNote
} from 'react-icons/fa';
import './../../../styles/inventory/supplier/SupplierDetails.css';

const SupplierDetails = ({ supplier, onBack, onEdit }) => {
    if (!supplier) {
        return (
            <div className="supplier-details-container">
                <div className="supplier-details-header">
                    <button className="back-button" onClick={onBack}>
                        <FaArrowLeft className="button-icon" />
                        <span>Back</span>
                    </button>
                    <h2>Supplier Details</h2>
                </div>
                <div className="supplier-details-content">
                    <p className="no-data-message">No supplier selected</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="supplier-details-container">
            <div className="supplier-details-header">
                <button className="back-button" onClick={onBack}>
                    <FaArrowLeft className="button-icon" />
                    <span>Back</span>
                </button>
                <h2>Supplier Details</h2>
                <button className="edit-button" onClick={() => onEdit(supplier)}>
                    <FaEdit className="button-icon" />
                    <span>Edit</span>
                </button>
            </div>

            <div className="supplier-details-content">
                <div className="supplier-info-card">
                    <div className="supplier-basic-info">
                        <div className="supplier-title">
                            <div className="supplier-icon-container">
                                <FaBuilding className="supplier-icon" />
                            </div>
                            <div className="supplier-name-container">
                                <h3>{supplier.name}</h3>
                                <span className="supplier-category">Auto Parts Supplier</span>
                            </div>
                        </div>
                        <span className="supplier-status">Active</span>
                    </div>

                    <div className="info-section">
                        <h4 className="section-title">Contact Information</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-icon-container">
                                    <FaUser className="info-icon" />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Contact Person</span>
                                    <span className="info-value">{supplier.contactPerson}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon-container">
                                    <FaPhone className="info-icon" />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Phone</span>
                                    <span className="info-value">{supplier.phone}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon-container">
                                    <FaEnvelope className="info-icon" />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Email</span>
                                    <span className="info-value">{supplier.email}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon-container">
                                    <FaMapMarkerAlt className="info-icon" />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Address</span>
                                    <span className="info-value">{supplier.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h4 className="section-title">Business Information</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-icon-container">
                                    <FaGlobe className="info-icon" />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Website</span>
                                    <span className="info-value">
                    <a href={`https://${supplier.website}`} target="_blank" rel="noopener noreferrer">
                      {supplier.website}
                    </a>
                  </span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon-container">
                                    <FaCalendar className="info-icon" />
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Supplier Since</span>
                                    <span className="info-value">{formatDate(supplier.createdAt)}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon-container">
                                    <div className="info-icon-placeholder"></div>
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Status</span>
                                    <span className="info-value">Active</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-icon-container">
                                    <div className="info-icon-placeholder"></div>
                                </div>
                                <div className="info-content">
                                    <span className="info-label">Category</span>
                                    <span className="info-value">Auto Parts</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h4 className="section-title">Additional Information</h4>
                        <div className="info-item full-width">
                            <div className="info-icon-container">
                                <FaStickyNote className="info-icon" />
                            </div>
                            <div className="info-content">
                                <span className="info-label">Notes</span>
                                <span className="info-value">
                  Primary supplier for various auto parts. Reliable delivery and good customer support.
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupplierDetails;