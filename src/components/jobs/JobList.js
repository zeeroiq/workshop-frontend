import React, {useState} from 'react';
import {
    FaCalendar,
    FaCar,
    FaClock,
    FaDollarSign,
    FaEdit,
    FaEye,
    FaFilter,
    FaPlus,
    FaSearch,
    FaTrash,
    FaUser,
    FaWrench
} from 'react-icons/fa';
import '../../styles/Jobs.css';
import {formatDateAsEnUS} from "../helper/utils";
import {getStatusBadge} from "./helper/utils";

const JobList = ({ jobs, onViewJob, onEditJob, onDeleteJob, onCreateJob, onShowCalendar }) => {

    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.license.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && job.status === activeTab;
    });

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
                                <tr key={job.jobNumber}>
                                    <td className="job-id">{job.jobNumber}</td>
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
                                            <FaClock className="time-icon"/>
                                            {formatDateAsEnUS(job.estimatedCompletion)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="cost">
                                        <FaDollarSign className="dollar-icon" />
                                        {job.cost.toFixed(2)}
                                        </div>
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