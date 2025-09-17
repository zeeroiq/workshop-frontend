import React from 'react';
import {
    FaArrowLeft,
    FaEdit,
    FaUser,
    FaCar,
    FaWrench,
    FaUserCog,
    FaCalendar,
    FaClock,
    FaDollarSign,
    FaFileAlt
} from 'react-icons/fa';
import '../../styles/Jobs.css';

const JobDetails = ({ job, onBack, onEdit }) => {
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'scheduled':
                return <span className="status-badge scheduled">Scheduled</span>;
            case 'in-progress':
                return <span className="status-badge in-progress">In Progress</span>;
            case 'completed':
                return <span className="status-badge completed">Completed</span>;
            default:
                return <span className="status-badge">Unknown</span>;
        }
    };

    if (!job) {
        return (
            <div className="job-details-container">
                <div className="job-not-found">
                    <button className="back-button" onClick={onBack}>
                        <FaArrowLeft /> Back to Jobs
                    </button>
                    <h2>Job not found</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="job-details-container">
            <div className="job-details-header">
                <button className="back-button" onClick={onBack}>
                    <FaArrowLeft /> Back to Jobs
                </button>
                <button className="edit-button" onClick={onEdit}>
                    <FaEdit /> Edit Job
                </button>
            </div>

            <div className="job-details-content">
                <div className="job-header">
                    <h2>{job.service}</h2>
                    <div className="job-id-status">
                        <span className="job-id">{job.id}</span>
                        {getStatusBadge(job.status)}
                    </div>
                </div>

                <div className="details-grid">
                    <div className="detail-section">
                        <h3>Customer Information</h3>
                        <div className="detail-item">
                            <FaUser className="detail-icon" />
                            <div>
                                <label>Customer</label>
                                <p>{job.customer}</p>
                            </div>
                        </div>
                        {job.customerId && (
                            <div className="detail-item">
                                <div>
                                    <label>Customer ID</label>
                                    <p>{job.customerId}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h3>Vehicle Information</h3>
                        <div className="detail-item">
                            <FaCar className="detail-icon" />
                            <div>
                                <label>Vehicle</label>
                                <p>{job.vehicle}</p>
                            </div>
                        </div>
                        {job.license && (
                            <div className="detail-item">
                                <div>
                                    <label>License Plate</label>
                                    <p>{job.license}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h3>Service Details</h3>
                        <div className="detail-item">
                            <FaWrench className="detail-icon" />
                            <div>
                                <label>Service</label>
                                <p>{job.service}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <FaUserCog className="detail-icon" />
                            <div>
                                <label>Technician</label>
                                <p>{job.technician}</p>
                            </div>
                        </div>
                        {job.description && (
                            <div className="detail-item">
                                <FaFileAlt className="detail-icon" />
                                <div>
                                    <label>Description</label>
                                    <p>{job.description}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h3>Schedule & Pricing</h3>
                        <div className="detail-item">
                            <FaCalendar className="detail-icon" />
                            <div>
                                <label>Created</label>
                                <p>{formatDate(job.createdAt)}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <FaClock className="detail-icon" />
                            <div>
                                <label>Estimated Completion</label>
                                <p>{formatDate(job.estimatedCompletion)}</p>
                            </div>
                        </div>
                        <div className="detail-item">
                            <FaDollarSign className="detail-icon" />
                            <div>
                                <label>Cost</label>
                                <p>${job.cost.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {job.notes && (
                    <div className="detail-section">
                        <h3>Additional Notes</h3>
                        <div className="notes-content">
                            <p>{job.notes}</p>
                        </div>
                    </div>
                )}

                {job.parts && job.parts.length > 0 && (
                    <div className="detail-section">
                        <h3>Parts Used</h3>
                        <table className="parts-table">
                            <thead>
                            <tr>
                                <th>Part Name</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                            </tr>
                            </thead>
                            <tbody>
                            {job.parts.map((part, index) => (
                                <tr key={index}>
                                    <td>{part.name}</td>
                                    <td>{part.quantity}</td>
                                    <td>${part.price.toFixed(2)}</td>
                                    <td>${(part.quantity * part.price).toFixed(2)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobDetails;