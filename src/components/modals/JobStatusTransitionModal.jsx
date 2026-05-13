import React, { useMemo } from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  STATUS_TRANSITIONS,
  STATUS_TRANSITION_PERMISSIONS,
  TERMINAL_STATUSES,
} from '@/utils/jobStatusRules';

/**
 * Job Status Transition Modal Component
 * Shows valid status transitions and handles status changes
 * Validates permissions and business rules
 *
 * @component
 * @param {object} job - Job object
 * @param {string} userRole - Current user role
 * @param {function} onStatusChange - Callback on status change (receives newStatus)
 * @param {function} onClose - Callback on close
 * @param {boolean} isOpen - Whether modal is visible
 * @returns {React.ReactElement}
 */
export const JobStatusTransitionModal = ({
  job,
  userRole = 'manager',
  onStatusChange = null,
  onClose = null,
  isOpen = true,
}) => {
  const currentStatus = job?.status;

  // Get valid next statuses
  const validNextStatuses = useMemo(() => {
    if (!currentStatus) return [];

    const nextStatuses = STATUS_TRANSITIONS[currentStatus] || [];

    // Filter by user role permissions
    return nextStatuses.filter((status) => {
      const permissions = STATUS_TRANSITION_PERMISSIONS[`${currentStatus}_to_${status}`];
      return permissions?.includes(userRole) || false;
    });
  }, [currentStatus, userRole]);

  // Check business rule: cannot close without payment
  const canClose = useMemo(() => {
    if (!job) return false;
    return job.status === 'completed' || job.paymentStatus === 'completed';
  }, [job]);

  const handleStatusTransition = (newStatus) => {
    // Validation
    if (newStatus === 'closed' && !canClose) {
      return;
    }

    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  };

  if (!isOpen || !job) return null;

  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Change Job Status</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Status
            </p>
            <StatusBadge status={currentStatus} />
          </div>

          {/* Terminal Status Warning */}
          {isTerminal && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Terminal Status
                  </p>
                  <p className="text-xs text-amber-800 dark:text-amber-200 mt-1">
                    This job is in a terminal state. Status changes may be restricted.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Valid Transitions */}
          {validNextStatuses.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Change to
              </p>
              <div className="space-y-2">
                {validNextStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusTransition(status)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-lg border-2',
                      'transition-all hover:shadow-md',
                      'border-gray-200 dark:border-gray-700',
                      'hover:border-blue-400 dark:hover:border-blue-600',
                      'hover:bg-blue-50 dark:hover:bg-blue-900/10'
                    )}
                  >
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {status.replace(/_/g, ' ')}
                      </p>
                      <StatusBadge status={status} />
                    </div>
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No valid transitions available for this status
              </p>
            </div>
          )}

          {/* Payment Validation */}
          {currentStatus !== 'closed' && !canClose && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Cannot close job
                  </p>
                  <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                    Job must be completed and payment collected before closing.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Job Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Work Order</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{job.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Customer</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {job.customer?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Date</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(job.date).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobStatusTransitionModal;
