import React, {useEffect, useState, useCallback} from 'react';
import JobList from './JobList';
import JobForm from './JobForm';
import JobDetails from './JobDetails';
import JobCalendar from './JobCalendar';

import {jobService} from "@/services/jobService";
import {toast} from "react-toastify";

const Jobs = () => {
    const [activeView, setActiveView] = useState('list');
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const refreshJobData = useCallback(async () => {
        if (!selectedJob?.id) return;
        try {
            const response = await jobService.getJobById(selectedJob.id);
            if (response?.data) {
                // Transform data for view
                const apiJob = response.data;
                const [vehicle, license] = (apiJob.vehicleDetails || ' - ').split(' - ');
                const serviceItems = apiJob.items?.filter(item => item.type === 'LABOR')
                    .map(item => item.description)
                    .join(', ');

                setSelectedJob({
                    id: apiJob.id,
                    jobNumber: apiJob.jobNumber,
                    customer: apiJob.customerName,
                    customerId: apiJob.customerId,
                    vehicle: vehicle?.trim(),
                    license: license?.trim(),
                    service: serviceItems || apiJob.description,
                    technicianId: apiJob.technicianId,
                    technician: apiJob.technicianName,
                    status: apiJob?.status?.toLowerCase()?.replace(/_/g, '-'), 
                    estimatedCompletion: apiJob.completedAt || apiJob.updatedAt, 
                    cost: apiJob.totalCost,
                    createdAt: apiJob.createdAt,
                    updatedAt: apiJob.updatedAt,
                    completedAt: apiJob.completedAt,
                    description: apiJob.description,
                    notes: apiJob.notes || [],
                    items: apiJob.items || [],
                });
            }
        } catch (error) {
            console.error('Refresh failed:', error);
        }
    }, [selectedJob?.id]);

    const handleSaveJob = async (jobData) => {
        const payload = { ...jobData };

        if (payload.notes && typeof payload.notes === 'string') {
            payload.notes = payload.notes
                .split('\n')
                .filter(content => content.trim() !== '')
                .map(content => ({ content }));
        } else {
            payload.notes = payload.notes || [];
        }
        
        try {
            if (jobData.jobNumber) {
                const response = await jobService.updateJobBuNumber(payload.jobNumber, payload);
                if (response.status === 200 && response.data) {
                    toast.success(`${response.data.jobNumber} synchronized successfully!`);
                } else {
                    toast.error(`Error while updating job: ${response.message}`);
                }
            } else {
                const response = await jobService.createJob(payload);
                if (response.status === 201 && response.data) {
                    toast.success(`${response.data.jobNumber} initialized successfully!`);
                } else {
                    toast.error(`Error while creating job: ${response.message}`);
                }
            }
            setActiveView('list');
            setSelectedJob(null);
        } catch (error) {
            console.error('Job save error:', error);
            toast.error(`Critical error during archival: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleDeleteJob = async (jobId) => {
        try {
            const response =  await jobService.deleteJob(jobId);
            if (response?.status === 200) {
                toast.success(`Job record purged.`);
            } else {
                toast.error(`Error while purging record: ${response.message}`);
            }
        } catch (error) {
            toast.error(`Purge failed: ${error.response?.data?.message || error.message}`);
        }
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
                        onRefresh={refreshJobData}
                    />
                );
            case 'calendar':
                return (
                    <JobCalendar
                        onSelectJob={handleViewJob}
                        onBack={handleBackToList}
                    />
                );
            default:
                return <JobList onCreateJob={handleCreateJob} />;
        }
    };

    return (
        <div className="w-full">
            {renderView()}
        </div>
    );
};

export default Jobs;
