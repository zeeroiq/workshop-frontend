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

const SupplierDetails = ({supplier, onBack, onEdit}) => {
    if (!supplier) {
        return (
            <div className="supplier-details-container">
                <div className="supplier-details-header">
                    <button className="back-button" onClick={onBack}>
                        <FaArrowLeft/> Back
                    </button>
                    <h2>Supplier Details</h2>
                </div>
                <div className="supplier-details-content">
                    <p>No supplier selected</p>
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
                    <FaArrowLeft/> Back To Suppliers
                </button>
                <h2>Supplier Details</h2>
                <button className="edit-button" onClick={() => onEdit(supplier)}>
                    <FaEdit/> Edit
                </button>
            </div>

            <div className="supplier-details-content">
                <div className="supplier-info-card">
                    <div className="supplier-basic-info">
                        <div className="supplier-title">
                            <FaBuilding className="supplier-icon"/>
                            <h3> {supplier.name}</h3>
                        </div>
                        <span className={`supplier-status ${supplier.status ? (supplier.status === 'ACTIVE' ? 'active' : 'inactive') : 'unknown'}`}>
                            {supplier.status}
                        </span>
                    </div>

                    <div className="info-section">
                        <h4>Contact Information</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-label">
                                    <FaUser className="info-icon"/>
                                    <span> Contact Person</span>
                                </div>
                                <span className="info-value">{supplier.contactPerson}</span>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <FaPhone className="info-icon"/>
                                    <span> Phone</span>
                                </div>
                                <span className="info-value">{supplier.phone}</span>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <FaEnvelope className="info-icon"/>
                                    <span> Email</span>
                                </div>
                                <span className="info-value">{supplier.email}</span>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <FaMapMarkerAlt className="info-icon"/>
                                    <span> Address</span>
                                </div>
                                <span className="info-value">{supplier.address}</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h4>Business Information</h4>
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-label">
                                    <FaGlobe className="info-icon"/>
                                    <span> Website</span>
                                </div>
                                <span className="info-value">
                                  <a href={`https://${supplier.website}`} target="_blank" rel="noopener noreferrer">
                                    {supplier.website}
                                  </a>
                                </span>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <FaCalendar className="info-icon"/>
                                    <span> Supplier Since</span>
                                </div>
                                <span className="info-value">{formatDate(supplier.createdAt)}</span>
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <span> Status</span>
                                </div>
                                {supplier.status
                                    ? <span className="info-value">{supplier.status}</span>
                                    : <span className="info-value">N/A</span>
                                    }
                            </div>
                            <div className="info-item">
                                <div className="info-label">
                                    <span> Category</span>
                                </div>
                                <span className="info-value">Auto Parts</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h4>Additional Information</h4>
                        <div className="info-grid">
                            <div className="info-item full-width">
                                <div className="info-label">
                                    <FaStickyNote className="info-icon"/>
                                    <span> Notes</span>
                                </div>
                                <span className="info-value">
                                  {supplier.notes ? supplier.notes : 'N/A'}
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