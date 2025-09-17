import React, { useState } from 'react';
import {
    FaWrench,
    FaCar,
    FaUser,
    FaCalendarAlt,
    FaClock,
    FaDollarSign,
    FaSearch,
    FaFilter,
    FaPlus,
    FaEdit,
    FaEye,
    FaTrash,
    FaCalendar
} from 'react-icons/fa';
import '../../styles/Jobs.css';

const JobList = ({ jobs, onViewJob, onEditJob, onDeleteJob, onCreateJob, onShowCalendar }) => {
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.license.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && job.status === activeTab;
    });

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

    const formatDate = (dateString) => {
        const options = {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <div className="job-list-container">
            <div className="job-list-header">
                <div className="header-left">
                    <FaWrench className="header-icon" />
                    <h2>Jobs Management</h2>
                </div>
                <div className="header-actions">
                    <button className="calendar-btn" onClick={onShowCalendar}>
                        <FaCalendar /> Calendar View
                    </button>
                    <button className="add-job-btn" onClick={onCreateJob}>
                        <FaPlus /> New Job
                    </button>
                </div>
            </div>

            <div className="job-list-content">
                <div className="job-list-filters">
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search jobs by ID, customer, vehicle..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-tabs">
                        <button
                            className={activeTab === 'all' ? 'active' : ''}
                            onClick={() => setActiveTab('all')}
                        >
                            <FaFilter /> All Jobs
                        </button>
                        <button
                            className={activeTab === 'scheduled' ? 'active' : ''}
                            onClick={() => setActiveTab('scheduled')}
                        >
                            Scheduled
                        </button>
                        <button
                            className={activeTab === 'in-progress' ? 'active' : ''}
                            onClick={() => setActiveTab('in-progress')}
                        >
                            In Progress
                        </button>
                        <button
                            className={activeTab === 'completed' ? 'active' : ''}
                            onClick={() => setActiveTab('completed')}
                        >
                            Completed
                        </button>
                    </div>
                </div>

                <div className="jobs-table-container">
                    {filteredJobs.length === 0 ? (
                        <div className="no-jobs">
                            <p>No jobs found matching your criteria</p>
                        </div>
                    ) : (
                        <table className="jobs-table">
                            <thead>
                            <tr>
                                <th>Job ID</th>
                                <th>Customer</th>
                                <th>Vehicle</th>
                                <th>Service</th>
                                <th>Technician</th>
                                <th>Status</th>
                                <th>Est. Completion</th>
                                <th>Cost</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredJobs.map(job => (
                                <tr key={job.id}>
                                    <td className="job-id">{job.id}</td>
                                    <td>
                                        <div className="customer-info">
                                            <FaUser className="info-icon" />
                                            {job.customer}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="vehicle-info">
                                            <FaCar className="info-icon" />
                                            <div>
                                                <div>{job.vehicle}</div>
                                                <div className="license-plate">{job.license}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="service">{job.service}</td>
                                    <td className="technician">{job.technician}</td>
                                    <td>{getStatusBadge(job.status)}</td>
                                    <td>
                                        <div className="completion-time">
                                            <FaClock className="time-icon" />
                                            {formatDate(job.estimatedCompletion)}
                                        </div>
                                    </td>
                                    <td className="cost">
                                        <FaDollarSign className="dollar-icon" />
                                        {job.cost.toFixed(2)}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-view" onClick={() => onViewJob(job)} title="View Details">
                                                <FaEye />
                                            </button>
                                            <button className="btn-edit" onClick={() => onEditJob(job)} title="Edit Job">
                                                <FaEdit />
                                            </button>
                                            <button className="btn-delete" onClick={() => onDeleteJob(job.id)} title="Delete Job">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobList;