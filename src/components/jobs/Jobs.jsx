import React, {useEffect, useState} from 'react';
import JobList from './JobList';
import JobForm from './JobForm';
import JobDetails from './JobDetails';
import JobCalendar from './JobCalendar';

import * as jobService from "@/services/jobService";
import {toast} from "react-toastify";

const Jobs = () => {
    const [activeView, setActiveView] = useState('list');
    const [selectedJob, setSelectedJob] = useState(null);
    const [loading, setLoading] = useState(false);
    // const [jobs, setJobs] = useState([]);

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
            payload.notes = payload.notes || []; // Ensure it's an empty array if no notes
        }
        
        if (jobData.id) {
            try {
                // Update existing job by id
                const response = await jobService.updateJob(jobData.id, payload);
                if ((response?.status >= 200 && response?.status < 300) && response.data) {
                    // Optionally refresh job list
                    await jobService.fetchJobs();
                    if (response?.data?.invoiceNumber) {
                        toast.success(`Created invoice ${response.data.invoiceNumber} for job ${response.data.jobNumber}`);
                    } else {
                        toast.success(`${response.data.jobNumber || jobData.id} updated successfully!`);
                    }
                } else {
                    toast.error(`Error while updating job: ${response?.message || 'Unknown error'}`);
                }
            } catch (error) {
                console.error(error?.response?.data || error);
                toast.error(`Error while updating job: ${error?.message || error}`);
            }
        } else {
            try {
                // Create new job
                const response = await jobService.createJob(payload);
                if ((response?.status >= 200 && response?.status < 300) && response.data) {
                    await jobService.fetchJobs(); // Reload to get the new job with all server-generated data
                    toast.success(`${response.data.jobNumber || 'Job'} created successfully!`);
                } else {
                    toast.error(`Error while creating job: ${response?.message || 'Unknown error'}`);
                }

            } catch (error) {
                console.error(error?.response?.data || error);
                toast.error(`Error while creating job: ${error?.message || error}`);
            }
        }
        setActiveView('list');
    };

    const handleDeleteJob = async (jobId) => {
        const response =  await jobService.deleteJob(jobId);
        if (response?.status === 200) {
            // await loadJobs(); // wont be needed as we already removed it from UI optimistically
            // setJobs(jobs.filter(job => job.jobNumber !== jobId));
            toast.success(`Job ${jobId} deleted successfully!`);
        } else {
            console.error("error deleting job:", response.details);
            toast.error(`Error while deleting job: ${response.message}`);
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
                        // jobs={jobs}
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
                        // jobs={jobs}
                        onSelectJob={handleViewJob}
                        onBack={handleBackToList}
                    />
                );
            default:
                return <JobList
                    // jobs={jobs}
                    onCreateJob={handleCreateJob} />;
        }
    };

    return (
        <div className="jobs-module">
            {renderView()}
        </div>
    );
};

export default Jobs;