import React, {useEffect, useState} from 'react';
import JobList from './JobList';
import JobForm from './JobForm';
import JobDetails from './JobDetails';
import JobCalendar from './JobCalendar';
import '../../styles/Jobs.css';
import {jobService} from "../../services/jobService";
import {toast} from "react-toastify";

const Jobs = () => {
    const [activeView, setActiveView] = useState('list');
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(false);
    // const [parts, setParts] = useState([]);
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        loadJobs();
    }, []);

    // const loadParts = async () => {
    //     try {
    //         setLoading(true);
    //         const response = await inventoryService.getParts();
    //         setParts(response.data.data.content);
    //     } catch (error) {
    //         console.error('Error loading parts:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const loadJobs = async () => {
        try {
            setLoading(true);
            const response = await jobService.getAllJobs();
            if (response?.data?.content?.length > 0) {
                const transformedJobs = response.data.content.map(transformJobData);
                setJobs(transformedJobs);
            }
        } catch (error) {
            console.error('Error loading jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const transformJobData = (apiJob) => {
        const [vehicle, license] = (apiJob.vehicleDetails || ' - ').split(' - ');
        const serviceItems = apiJob.parts?.filter(item => item.type === 'LABOR').map(item => item.description).join(', ');

        return {
            key: apiJob.id,
            id: apiJob.jobNumber,
            customer: apiJob.customerName,
            customerId: apiJob.customerId,
            vehicle: vehicle.trim(),
            license: license.trim(),
            service: serviceItems || apiJob.description,
            technicianId: apiJob.technicianId,
            technician: apiJob.technicianName,
            status: apiJob.status.toLowerCase(), // e.g., 'COMPLETED' -> 'completed'
            estimatedCompletion: apiJob.completedAt || apiJob.updatedAt, // Using completedAt or updatedAt as a fallback
            cost: apiJob.totalCost,
            createdAt: apiJob.createdAt,
            description: apiJob.description,
            notes: apiJob.notes?.map(note => note.content).join('\n'),
            parts: apiJob.parts?.filter(item => item.type === 'PART').map(part => ({
                partId: part.id,
                name: part.partName || part.description,
                quantity: part.quantity,
                price: part.rate,
                totalCost: part.totalCost
            })) || [],
        };
    };

    /*
    const [jobs, setJobs] = useState([
        {
            id: 'JOB-001',
            customer: 'John Smith',
            customerId: 'CUST-001',
            vehicle: '2018 Toyota Camry',
            license: 'ABC-123',
            service: 'Oil Change & Brake Inspection',
            technician: 'Mike Johnson',
            status: 'in-progress',
            estimatedCompletion: '2023-10-25T14:30:00',
            cost: 89.99,
            createdAt: '2023-10-24T09:15:00',
            description: 'Full synthetic oil change and comprehensive brake system inspection',
            notes: 'Customer reported slight vibration when braking',
            parts: [
                { name: 'Synthetic Oil 5W-30', quantity: 5, price: 12.99 },
                { name: 'Oil Filter', quantity: 1, price: 9.99 }
            ]
        },
        {
            id: 'JOB-002',
            customer: 'Sarah Wilson',
            customerId: 'CUST-002',
            vehicle: '2020 Honda CR-V',
            license: 'XYZ-789',
            service: 'Tire Rotation & Balance',
            technician: 'Emily Chen',
            status: 'scheduled',
            estimatedCompletion: '2023-10-26T11:00:00',
            cost: 45.00,
            createdAt: '2023-10-23T14:20:00',
            description: 'Four-tire rotation and wheel balancing',
            notes: 'Customer requested nitrogen refill after balancing',
            parts: []
        },
        {
            id: 'JOB-003',
            customer: 'Robert Davis',
            customerId: 'CUST-003',
            vehicle: '2016 Ford F-150',
            license: 'TRK-456',
            service: 'Transmission Flush',
            technician: 'Carlos Rodriguez',
            status: 'completed',
            estimatedCompletion: '2023-10-24T16:45:00',
            cost: 149.99,
            createdAt: '2023-10-22T10:05:00',
            description: 'Complete transmission fluid flush and replacement',
            notes: 'Transmission was making whining noise prior to service',
            parts: [
                { name: 'Transmission Fluid', quantity: 12, price: 8.99 }
            ]
        }
    ]);
*/
    const handleViewJob = (job) => {
        setSelectedJob(job);
        setActiveView('details');
    };

    const handleEditJob = (job) => {
        setSelectedJob(job);
        setActiveView('form');
    };

    const handleCreateJob = () => {
        setSelectedJob(null);
        setActiveView('form');
    };

    const handleSaveJob = async (jobData) => {
        // Prepare payload for the API
        const payload = { ...jobData };

        // Transform notes from a single string to an array of objects
        if (payload.notes && typeof payload.notes === 'string') {
            payload.notes = payload.notes
                .split('\n')
                .filter(content => content.trim() !== '') // Remove empty lines
                .map(content => ({ content }));
        } else {
            payload.notes = []; // Ensure it's an empty array if no notes
        }
        
        if (jobData.id) {
            // Update existing job
            const response = await jobService.updateJob(payload.id, payload);
            if (response.status === 200 && response.data) {
                // On successful update, reload all jobs to ensure data consistency
                await loadJobs();
                toast.success("Job updated successfully!");
            } else {
                toast.error(`Error while updating job: ${response.message}`);
            }
            // setJobs(jobs.map(job => job.id === jobData.id ? jobData : job));
        } else {
            // Create new job
            const response = await jobService.createJob(payload);
            if (response.status === 201 && response.data) {
                await loadJobs(); // Reload to get the new job with all server-generated data
                toast.success("Job created successfully!");
            } else {
                toast.error(`Error while creating job: ${response.message}`);
            }
        }
        setActiveView('list');
    };

    const handleDeleteJob = async (jobId, key) => {
        setJobs(jobs.filter(job => job.id !== jobId));
        const response =  await jobService.deleteJob(key);
        if (response.status === 200 && response.data) {
            // await loadJobs(); // wont be needed as we already removed it from UI optimistically
        } else {
            console.error("error deleting job:", response.message);
            toast.error(`Error while deleting job: ${response.message}`);
        }
        // toast.success("Job deleted successfully!");
    };

    const handleBackToList = () => {
        setActiveView('list');
        setSelectedJob(null);
    };

    const renderView = () => {
        switch (activeView) {
            case 'list':
                return (
                    <JobList
                        jobs={jobs}
                        onViewJob={handleViewJob}
                        onEditJob={handleEditJob}
                        onDeleteJob={handleDeleteJob}
                        onCreateJob={handleCreateJob}
                        onShowCalendar={() => setActiveView('calendar')}
                    />
                );
            case 'form':
                return (
                    <JobForm
                        job={selectedJob}
                        onSave={handleSaveJob}
                        onCancel={handleBackToList}
                    />
                );
            case 'details':
                return (
                    <JobDetails
                        job={selectedJob}
                        onBack={handleBackToList}
                        onEdit={() => handleEditJob(selectedJob)}
                    />
                );
            case 'calendar':
                return (
                    <JobCalendar
                        jobs={jobs}
                        onSelectJob={handleViewJob}
                        onBack={handleBackToList}
                    />
                );
            default:
                return <JobList jobs={jobs} onCreateJob={handleCreateJob} />;
        }
    };

    return (
        <div className="jobs-module">
            {renderView()}
        </div>
    );
};

export default Jobs;