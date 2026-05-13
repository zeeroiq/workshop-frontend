import React, { useMemo } from 'react';
import { useTechnicianStore } from '@/stores/technicianStore';
import { useJobStore } from '@/stores/jobStore';
import { TechnicianAvatar } from '@/components/ui/technician-avatar';
import { formatDateFull, calculateDurationMinutes } from '@/utils/dateFormatting';

/**
 * Technician Roster View Component
 * Shows technicians with their scheduled jobs and availability
 * Displays utilization and specializations
 *
 * @component
 * @param {string} selectedDate - Date to display (YYYY-MM-DD)
 * @param {function} onTechnicianClick - Callback when technician clicked
 * @param {function} onJobClick - Callback when job clicked
 * @returns {React.ReactElement}
 */
export const TechnicianRosterView = ({
  selectedDate,
  onTechnicianClick = null,
  onJobClick = null,
}) => {
  const technicians = useTechnicianStore((state) => state.technicians);
  const jobs = useJobStore((state) => state.jobs);

  // Filter jobs for selected date
  const dayJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const jobDate = new Date(job.date).toISOString().split('T')[0];
        return jobDate === selectedDate;
      }),
    [jobs, selectedDate]
  );

  // Organize jobs by technician
  const jobsByTechnician = useMemo(() => {
    const map = {};
    technicians.forEach((tech) => {
      map[tech.id] = [];
    });

    dayJobs.forEach((job) => {
      if (job.assignedTechnicians) {
        job.assignedTechnicians.forEach((techId) => {
          if (map[techId]) {
            map[techId].push(job);
          }
        });
      }
    });

    return map;
  }, [technicians, dayJobs]);

  // Calculate utilization
  const techUtilization = useMemo(() => {
    const stats = {};
    const workingMinutes = 9 * 60; // 9 hour day

    technicians.forEach((tech) => {
      const techJobs = jobsByTechnician[tech.id] || [];
      const totalMinutes = techJobs.reduce((sum, job) => {
        return sum + calculateDurationMinutes(job.startTime, job.endTime);
      }, 0);

      stats[tech.id] = {
        jobs: techJobs.length,
        minutes: totalMinutes,
        percentage: Math.round((totalMinutes / workingMinutes) * 100),
      };
    });

    return stats;
  }, [technicians, jobsByTechnician]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Technician Roster - {formatDateFull(selectedDate)}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {technicians.length} technicians • {dayJobs.length} jobs assigned
        </p>
      </div>

      {/* Roster List */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-3 p-4">
          {technicians.map((tech) => {
            const util = techUtilization[tech.id];
            const techJobs = jobsByTechnician[tech.id] || [];
            const utilizationColor =
              util.percentage < 50
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : util.percentage < 80
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';

            return (
              <div
                key={tech.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Technician Header */}
                <button
                  onClick={() => onTechnicianClick?.(tech)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Avatar */}
                  <TechnicianAvatar
                    technician={tech}
                    size="lg"
                  />

                  {/* Details */}
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {tech.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {tech.specialization}
                      </span>
                      {tech.isAvailable ? (
                        <span className="text-xs px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          Available
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Utilization */}
                  <div className={`text-right px-3 py-2 rounded ${utilizationColor}`}>
                    <div className="text-sm font-bold">{util.percentage}%</div>
                    <div className="text-xs">{util.jobs} jobs</div>
                  </div>
                </button>

                {/* Jobs for this technician */}
                {techJobs.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Assigned Jobs:
                    </p>
                    <div className="space-y-2">
                      {techJobs.map((job) => (
                        <button
                          key={job.id}
                          onClick={() => onJobClick?.(job)}
                          className="w-full text-left p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {job.id}: {job.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {job.startTime} - {job.endTime}
                              </p>
                            </div>
                            <span
                              className="text-xs font-medium px-2 py-1 rounded flex-shrink-0"
                              style={{
                                backgroundColor: '#e0e7ff',
                                color: '#312e81',
                              }}
                            >
                              {job.status}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TechnicianRosterView;
