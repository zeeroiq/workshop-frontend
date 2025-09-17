import React, { useState } from 'react';
import JobList from './JobList';
import JobForm from './JobForm';
import JobDetails from './JobDetails';
import JobCalendar from './JobCalendar';
import './../../styles/jobs.css';

const Jobs = () => {
    const [activeView, setActiveView] = useState('list');
    const [selectedJob, setSelectedJob] = useState(null);
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

    const handleSaveJob = (jobData) => {
        if (jobData.id) {
            // Update existing job
            setJobs(jobs.map(job => job.id === jobData.id ? jobData : job));
        } else {
            // Create new job
            const newJob = {
                ...jobData,
                id: `JOB-${String(jobs.length + 1).padStart(3, '0')}`,
                createdAt: new Date().toISOString()
            };
            setJobs([...jobs, newJob]);
        }
        setActiveView('list');
    };

    const handleDeleteJob = (jobId) => {
        setJobs(jobs.filter(job => job.id !== jobId));
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