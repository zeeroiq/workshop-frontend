import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as jobService from '@/services/jobService';

/**
 * Job Store (Zustand)
 * Global state management for jobs
 */

const useJobStore = create(
  devtools(
    (set, get) => ({
      // State
      jobs: [],
      selectedJob: null,
      loading: false,
      error: null,
      filters: {
        date: null,
        bayId: null,
        techId: null,
        status: null,
      },
      dateRange: null,
      sortBy: 'date',
      sortOrder: 'asc',

      // Actions - Fetch jobs
      fetchJobs: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
          const jobs = await jobService.fetchJobs(filters);
          set({ jobs, loading: false });
          return jobs;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchJobsByDate: async (date) => {
        set({ loading: true, error: null });
        try {
          const jobs = await jobService.fetchJobsByDate(date);
          set({ jobs, loading: false });
          return jobs;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchJobsByWeek: async (startDate) => {
        set({ loading: true, error: null });
        try {
          const jobs = await jobService.fetchJobsByWeek(startDate);
          set({ jobs, loading: false });
          return jobs;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchJobById: async (jobId) => {
        set({ loading: true, error: null });
        try {
          const job = await jobService.fetchJobById(jobId);
          set({ selectedJob: job, loading: false });
          return job;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Actions - Create/Update/Delete
      addJob: async (jobData) => {
        set({ loading: true, error: null });
        try {
          const newJob = await jobService.createJob(jobData);
          set((state) => ({
            jobs: [...state.jobs, newJob],
            loading: false,
          }));
          return newJob;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateJob: async (jobId, jobData) => {
        set({ loading: true, error: null });
        try {
          const updatedJob = await jobService.updateJob(jobId, jobData);
          set((state) => ({
            jobs: state.jobs.map((job) => (job.id === jobId ? updatedJob : job)),
            selectedJob: state.selectedJob?.id === jobId ? updatedJob : state.selectedJob,
            loading: false,
          }));
          return updatedJob;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      deleteJob: async (jobId, reason = '') => {
        set({ loading: true, error: null });
        try {
          await jobService.deleteJob(jobId, reason);
          set((state) => ({
            jobs: state.jobs.filter((job) => job.id !== jobId),
            selectedJob: state.selectedJob?.id === jobId ? null : state.selectedJob,
            loading: false,
          }));
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Actions - Status
      updateJobStatus: async (jobId, status, note = null) => {
        set({ loading: true, error: null });
        try {
          const updatedJob = await jobService.updateJobStatus(jobId, status, note);
          set((state) => ({
            jobs: state.jobs.map((job) => (job.id === jobId ? updatedJob : job)),
            selectedJob: state.selectedJob?.id === jobId ? updatedJob : state.selectedJob,
            loading: false,
          }));
          return updatedJob;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      rescheduleJob: async (jobId, bayId, date, startTime, endTime) => {
        set({ loading: true, error: null });
        try {
          const updatedJob = await jobService.rescheduleJob(jobId, bayId, date, startTime, endTime);
          set((state) => ({
            jobs: state.jobs.map((job) => (job.id === jobId ? updatedJob : job)),
            selectedJob: state.selectedJob?.id === jobId ? updatedJob : state.selectedJob,
            loading: false,
          }));
          return updatedJob;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      reassignTechnician: async (jobId, technicianId) => {
        set({ loading: true, error: null });
        try {
          const updatedJob = await jobService.reassignTechnician(jobId, technicianId);
          set((state) => ({
            jobs: state.jobs.map((job) => (job.id === jobId ? updatedJob : job)),
            selectedJob: state.selectedJob?.id === jobId ? updatedJob : state.selectedJob,
            loading: false,
          }));
          return updatedJob;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      // Actions - Notes
      addNote: async (jobId, noteData) => {
        try {
          const note = await jobService.addJobNote(jobId, noteData);
          set((state) => {
            const updatedJobs = state.jobs.map((job) => {
              if (job.id === jobId) {
                return {
                  ...job,
                  notes: [...(job.notes || []), note],
                };
              }
              return job;
            });
            return {
              jobs: updatedJobs,
              selectedJob:
                state.selectedJob?.id === jobId
                  ? {
                      ...state.selectedJob,
                      notes: [...(state.selectedJob.notes || []), note],
                    }
                  : state.selectedJob,
            };
          });
          return note;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      // Actions - UI
      setSelectedJob: (job) => set({ selectedJob: job }),
      clearSelectedJob: () => set({ selectedJob: null }),
      setFilters: (filters) => set({ filters }),
      setDateRange: (dateRange) => set({ dateRange }),
      setSortBy: (sortBy, sortOrder = 'asc') => set({ sortBy, sortOrder }),
      clearFilters: () => set({ filters: {} }),

      // Selectors
      getJobsByBay: (bayId) => {
        const state = get();
        return state.jobs.filter((job) => job.bayId === bayId);
      },

      getJobsByTechnician: (techId) => {
        const state = get();
        return state.jobs.filter((job) => job.technicianId === techId);
      },

      getJobsByStatus: (status) => {
        const state = get();
        return state.jobs.filter((job) => job.status === status);
      },

      getOverdueJobs: () => {
        const state = get();
        const now = new Date();
        return state.jobs.filter((job) => {
          if (!job.date || !job.endTime) return false;
          const jobEndTime = new Date(`${job.date}T${job.endTime}`);
          return now > jobEndTime && !['closed', 'cancelled'].includes(job.status);
        });
      },

      getAwaitingPartsJobs: () => {
        const state = get();
        return state.jobs.filter((job) => job.status === 'awaiting_parts');
      },
    }),
    { name: 'JobStore' }
  )
);

export default useJobStore;
