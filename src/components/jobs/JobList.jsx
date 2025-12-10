import React, {useEffect, useState} from 'react';
import {
    FaCalendar,
    FaCar,
    FaClock,
    FaEdit,
    FaEye,
    FaFileInvoice,
    FaFilter,
    FaPlus,
    FaRupeeSign,
    FaSearch,
    FaTrash,
    FaUser,
    FaWrench
} from 'react-icons/fa';
import '../../styles/Jobs.css';
import {formatDateAsEnUS} from "../helper/utils";
import {getStatusBadge} from "./helper/utils";
import {jobService} from "@/services/jobService";
import {toast} from "react-toastify";

const JobList = ({onViewJob, onEditJob, onDeleteJob, onCreateJob, onShowCalendar}) => {

    const [jobs, setJobs] = useState([]);
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadJobs();
    }, [currentPage]);

    const loadJobs = async () => {
        try {
            setLoading(true);
            const response = await jobService.getAllJobs(currentPage, 10);
            if (response?.data?.content?.length > 0) {
                setJobs(response.data.content.map(transformJobData));
                setTotalPages(response.data.totalPages || 1);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const transformJobData = (apiJob) => {
        const [vehicle, license] = (apiJob.vehicleDetails || ' - ').split(' - ');
        const serviceItems = apiJob.items?.filter(item => item.type === 'LABOR')
            .map(item => item.description)
            .join(', ');

        return {
            id: apiJob.id,
            jobNumber: apiJob.jobNumber,
            customer: apiJob.customerName,
            customerId: apiJob.customerId,
            vehicle: vehicle.trim(),
            license: license.trim(),
            service: serviceItems || apiJob.description,
            technicianId: apiJob.technicianId,
            technician: apiJob.technicianName,
            status: apiJob.status.toLowerCase().replace(/_/g, '-'), // e.g., 'IN_PROGRESS' -> 'in-progress'
            estimatedCompletion: apiJob.completedAt || apiJob.updatedAt, // Using completedAt or updatedAt as a fallback
            cost: apiJob.totalCost,
            createdAt: apiJob.createdAt,
            description: apiJob.description,
            notes: apiJob.notes || [],
            // items: apiJob.items?.filter(item => item.type === 'PART').map(part => ({
            //     partId: part.id,
            //     partNumber: part.jobNumber,
            //     partName: part.partName || part.description,
            //     description: part.description,
            //     quantity: part.quantity,
            //     rate: part.rate,
            //     totalCost: part.totalCost,
            //     type: part.type,
            // })) || [],
            items: apiJob.items || [],
        };
    };


    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.license.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'all') return matchesSearch;
        return matchesSearch && job.status === activeTab;
    });

    const createInvoice = async (jobId) => {
        // Implement invoice creation logic here
        const response = await jobService.createInvoice(jobId);
        if (response.status === 200 && response.data) {
            toast.dark("Invoice created successfully");
        } else {
            toast.error("Failed to create invoice");
        }
    }

    return (
        <div className="job-list-container">
            <div className="job-list-header">
                <div className="header-left">
                    <FaWrench className="header-icon"/>
                    <h2>Jobs Management</h2>
                </div>
                <div className="header-actions">
                    <button className="calendar-btn" onClick={onShowCalendar}>
                        <FaCalendar/> Calendar View
                    </button>
                    <button className="add-job-btn" onClick={onCreateJob}>
                        <FaPlus/> New Job
                    </button>
                </div>
            </div>

            <div className="job-list-content">
                <div className="job-list-filters">
                    <div className="search-box">
                        <FaSearch className="search-icon"/>
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
                            <FaFilter/> All Jobs
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
                        <>
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
                                                <FaUser className="info-icon"/>
                                                {job.customer}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="vehicle-info">
                                                <FaCar className="info-icon"/>
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
                                                <FaRupeeSign className="dollar-icon"/>
                                                {job.cost.toFixed(2)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="btn-view" onClick={() => onViewJob(job)}
                                                        title="View Details">
                                                    <FaEye/>
                                                </button>
                                                <button className="btn-edit" onClick={() => onEditJob(job)}
                                                        title="Edit Job">
                                                    <FaEdit/>
                                                </button>
                                                <button className="btn-delete" onClick={() => onDeleteJob(job.id)}
                                                        title="Delete Job">
                                                    <FaTrash/>
                                                </button>
                                                <button className="btn-invoice" onClick={() => createInvoice(job.id)}
                                                        title="Create Invoice">
                                                    <FaFileInvoice/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            <div className="pagination">
                                <button
                                    disabled={currentPage === 0}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Previous
                                </button>
                                <span>Page {currentPage + 1} of {totalPages}</span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobList;