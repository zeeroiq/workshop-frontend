import React, { useMemo } from 'react';
import { useJobStore } from '@/stores/jobStore';
import { JobCard } from '@/components/ui/job-card';
import { CapacityBar } from '@/components/ui/capacity-bar';
import {
  formatDateShort,
  getWeekDays,
  calculateDurationMinutes,
  formatWeekLabel,
  getWorkingHours,
} from '@/utils/dateFormatting';

/**
 * Week View Component
 * Displays jobs for a full week (Mon-Sat) organized by day
 * Shows capacity bars for each day
 * Supports job navigation
 *
 * @component
 * @param {string} selectedDate - Any date in the week (YYYY-MM-DD)
 * @param {function} onJobClick - Callback when job clicked
 * @param {function} onDayClick - Callback when day header clicked
 * @returns {React.ReactElement}
 */
export const WeekView = ({
  selectedDate,
  onJobClick = null,
  onDayClick = null,
}) => {
  const jobs = useJobStore((state) => state.jobs);

  // Get week days starting from Monday
  const weekDays = useMemo(() => {
    const days = getWeekDays(selectedDate);
    return days;
  }, [selectedDate]);

  // Filter and organize jobs by day
  const jobsByDay = useMemo(() => {
    const map = {};
    weekDays.forEach((day) => {
      map[day] = [];
    });

    jobs.forEach((job) => {
      const jobDate = new Date(job.date).toISOString().split('T')[0];
      if (map[jobDate]) {
        map[jobDate].push(job);
      }
    });

    return map;
  }, [jobs, weekDays]);

  // Calculate capacity utilization for each day
  const dayCapacity = useMemo(() => {
    const capacity = {};
    const { startHour, endHour } = getWorkingHours(new Date().toISOString().split('T')[0]);
    const workingMinutes = (endHour - startHour) * 60;

    weekDays.forEach((day) => {
      const dayJobs = jobsByDay[day] || [];
      const totalMinutes = dayJobs.reduce((sum, job) => {
        return sum + calculateDurationMinutes(job.startTime, job.endTime);
      }, 0);

      capacity[day] = {
        used: totalMinutes,
        total: workingMinutes,
        percentage: Math.round((totalMinutes / workingMinutes) * 100),
      };
    });

    return capacity;
  }, [weekDays, jobsByDay]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatWeekLabel(selectedDate)}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {Object.values(jobsByDay).reduce((sum, arr) => sum + arr.length, 0)} jobs this week
        </p>
      </div>

      {/* Week Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4">
          {weekDays.map((day) => {
            const dayJobs = jobsByDay[day] || [];
            const capacity = dayCapacity[day];
            const isToday = day === new Date().toISOString().split('T')[0];

            return (
              <div
                key={day}
                className={`flex flex-col border rounded-lg overflow-hidden transition-all ${
                  isToday
                    ? 'border-blue-300 dark:border-blue-600 ring-2 ring-blue-200 dark:ring-blue-900'
                    : 'border-gray-200 dark:border-gray-700'
                } hover:shadow-lg`}
              >
                {/* Day Header */}
                <button
                  onClick={() => onDayClick?.(day)}
                  className={`px-4 py-3 font-semibold text-center cursor-pointer transition-colors ${
                    isToday
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="text-sm font-semibold">{formatDateShort(day)}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(day).toLocaleDateString('en-IN', { weekday: 'short' })}
                  </div>
                </button>

                {/* Capacity Bar */}
                {capacity && (
                  <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <CapacityBar
                      used={capacity.used}
                      total={capacity.total}
                      label={`${capacity.percentage}%`}
                      showLabel={true}
                    />
                  </div>
                )}

                {/* Jobs List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
                  {dayJobs.length > 0 ? (
                    dayJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => onJobClick?.(job)}
                        className="w-full text-left"
                      >
                        <JobCard
                          job={job}
                          onClick={() => onJobClick?.(job)}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                        />
                      </button>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                      No jobs
                    </div>
                  )}
                </div>

                {/* Job Count */}
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                  {dayJobs.length} {dayJobs.length === 1 ? 'job' : 'jobs'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;
