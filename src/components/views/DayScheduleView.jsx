import React, { useMemo, useState } from 'react';
import { useJobStore } from '@/stores/jobStore';
import { useBayStore } from '@/stores/bayStore';
import { JobCard } from '@/components/ui/job-card';
import { cn } from '@/lib/utils';
import { formatTime, formatDateFull, getWorkingHours } from '@/utils/dateFormatting';
import '@/styles/calendar-grid.css';

/**
 * Day Schedule View Component
 * Displays jobs organized by bay and time of day
 * Uses CSS Grid layout with sticky headers
 * Supports job details modal and drag-drop rescheduling (with handlers)
 *
 * @component
 * @param {string} selectedDate - Date to display (YYYY-MM-DD)
 * @param {function} onJobClick - Callback when job clicked
 * @param {function} onJobReschedule - Callback when job dragged to new time/bay
 * @returns {React.ReactElement}
 */
export const DayScheduleView = ({
  selectedDate,
  onJobClick = null,
  onJobReschedule = null,
}) => {
  const jobs = useJobStore((state) => state.jobs);
  const bays = useBayStore((state) => state.bays);
  const [draggedJob, setDraggedJob] = useState(null);

  // Filter jobs for selected date
  const dayJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const jobDate = new Date(job.date).toISOString().split('T')[0];
        return jobDate === selectedDate;
      }),
    [jobs, selectedDate]
  );

  // Get working hours
  const { startHour, endHour } = getWorkingHours(selectedDate);

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        hour,
        label: formatTime(new Date(2024, 0, 1, hour, 0)),
        startMinute: hour * 60,
        endMinute: (hour + 1) * 60,
      });
    }
    return slots;
  }, [startHour, endHour]);

  // Organize jobs by bay and time
  const jobsByBayAndTime = useMemo(() => {
    const map = {};

    // Initialize map
    bays.forEach((bay) => {
      map[bay.id] = {};
      timeSlots.forEach((slot) => {
        map[bay.id][slot.hour] = [];
      });
    });

    // Place jobs
    dayJobs.forEach((job) => {
      const bayId = job.bayId;
      if (bayId && map[bayId]) {
        const jobHour = parseInt(job.startTime.split(':')[0]);
        if (map[bayId][jobHour]) {
          map[bayId][jobHour].push(job);
        }
      }
    });

    return map;
  }, [bays, dayJobs, timeSlots]);

  const handleDragStart = (e, job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, bayId, hour) => {
    e.preventDefault();
    if (draggedJob && onJobReschedule) {
      const newStartTime = `${hour.toString().padStart(2, '0')}:00`;
      onJobReschedule(draggedJob.id, {
        bayId,
        startTime: newStartTime,
      });
    }
    setDraggedJob(null);
  };

  const handleDragEnd = () => {
    setDraggedJob(null);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatDateFull(selectedDate)}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {bays.length} bays • {dayJobs.length} jobs scheduled
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="calendar-grid-body">
          {/* Time Header */}
          <div className="calendar-grid-time-header sticky top-0 z-20 bg-white dark:bg-gray-900">
            {timeSlots.map((slot) => (
              <div
                key={slot.hour}
                className="calendar-grid-time-cell border-r border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400"
              >
                {slot.label}
              </div>
            ))}
          </div>

          {/* Bays */}
          {bays.map((bay) => (
            <div key={bay.id} className="calendar-grid-bay-row">
              {/* Bay Label */}
              <div className="calendar-grid-bay-header sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center px-3 py-2">
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {bay.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{bay.type}</p>
                </div>
              </div>

              {/* Time Cells */}
              {timeSlots.map((slot) => (
                <div
                  key={`${bay.id}-${slot.hour}`}
                  className="calendar-grid-cell border-r border-gray-200 dark:border-gray-700 border-b bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, bay.id, slot.hour)}
                  style={{
                    minHeight: '120px',
                    position: 'relative',
                  }}
                >
                  {/* Jobs in this slot */}
                  <div className="p-1 space-y-1">
                    {jobsByBayAndTime[bay.id]?.[slot.hour]?.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onClick={() => onJobClick?.(job)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, job)}
                        onDragEnd={handleDragEnd}
                        className="cursor-move hover:shadow-md transition-shadow"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Current Time Indicator */}
      <div className="text-xs text-gray-600 dark:text-gray-400 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        Last updated: {new Date().toLocaleTimeString('en-IN')}
      </div>
    </div>
  );
};

export default DayScheduleView;
