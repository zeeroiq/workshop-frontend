import React, { useState, useMemo } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateFull, formatTimeRange } from '@/utils/dateFormatting';
import { validateJobScheduling } from '@/utils/conflictDetection';

/**
 * Reschedule Job Modal Component
 * Quick reschedule UI for changing date/time/bay
 * Shows available slots and conflicts
 *
 * @component
 * @param {object} job - Job to reschedule
 * @param {array} bays - Available bays
 * @param {array} existingJobs - List of jobs (for conflict detection)
 * @param {function} onReschedule - Callback on reschedule (receives updated job)
 * @param {function} onClose - Callback on close
 * @param {boolean} isOpen - Whether modal is visible
 * @returns {React.ReactElement}
 */
export const RescheduleJobModal = ({
  job,
  bays = [],
  existingJobs = [],
  onReschedule = null,
  onClose = null,
  isOpen = true,
}) => {
  const [newDate, setNewDate] = useState(job?.date || '');
  const [newStartTime, setNewStartTime] = useState(job?.startTime || '09:00');
  const [newEndTime, setNewEndTime] = useState(job?.endTime || '10:00');
  const [newBayId, setNewBayId] = useState(job?.bayId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Check for conflicts with new schedule
  const hasConflicts = useMemo(() => {
    if (!newDate || !newStartTime || !newEndTime || !newBayId) {
      return false;
    }

    // Exclude current job from conflict check
    const otherJobs = existingJobs.filter((j) => j.id !== job?.id);

    const result = validateJobScheduling({
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      bayId: newBayId,
      existingJobs: otherJobs,
    });

    return !result.isValid;
  }, [newDate, newStartTime, newEndTime, newBayId, job?.id, existingJobs]);

  const handleReschedule = async () => {
    setValidationError(null);

    // Validate
    if (!newDate || !newStartTime || !newEndTime || !newBayId) {
      setValidationError('All fields are required');
      return;
    }

    if (hasConflicts) {
      setValidationError('This time slot has conflicts with other jobs');
      return;
    }

    if (onReschedule) {
      setIsSubmitting(true);
      try {
        await onReschedule({
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          bayId: newBayId,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen || !job) return null;

  const selectedBay = bays.find((b) => b.id === newBayId);
  const hasChanged =
    newDate !== job.date ||
    newStartTime !== job.startTime ||
    newEndTime !== job.endTime ||
    newBayId !== job.bayId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Reschedule Job {job.id}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Schedule */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Schedule
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm space-y-1">
              <p>
                <span className="text-gray-600 dark:text-gray-400">Date:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatDateFull(job.date)}
                </span>
              </p>
              <p>
                <span className="text-gray-600 dark:text-gray-400">Time:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatTimeRange(job.startTime, job.endTime)}
                </span>
              </p>
              <p>
                <span className="text-gray-600 dark:text-gray-400">Bay:</span>{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  {bays.find((b) => b.id === job.bayId)?.name || 'N/A'}
                </span>
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {validationError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-800 dark:text-red-200">{validationError}</p>
            </div>
          )}

          {/* Conflict Warning */}
          {hasConflicts && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                This time slot has scheduling conflicts
              </p>
            </div>
          )}

          {/* New Schedule */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              New Schedule
            </p>

            <div className="space-y-3">
              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Date
                </label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="text-sm"
                />
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Start
                  </label>
                  <Input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    End
                  </label>
                  <Input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Bay */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Bay
                </label>
                <select
                  value={newBayId}
                  onChange={(e) => setNewBayId(e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                  )}
                >
                  <option value="">Select bay</option>
                  {bays.map((bay) => (
                    <option key={bay.id} value={bay.id}>
                      {bay.name} ({bay.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* New Schedule Preview */}
          {newDate && newStartTime && newEndTime && selectedBay && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">New Schedule:</p>
                  <p>{formatDateFull(newDate)}</p>
                  <p>{newStartTime} → {newEndTime}</p>
                  <p>Bay: {selectedBay.name}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={isSubmitting || !hasChanged || hasConflicts}
            className="flex-1"
          >
            {isSubmitting ? 'Rescheduling...' : 'Reschedule'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleJobModal;
