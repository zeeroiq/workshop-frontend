/**
 * Job Status Rules & Validation
 * Defines valid status transitions and role-based permissions
 */

export const JOB_STATUSES = {
  BOOKED: 'booked',
  VEHICLE_IN: 'vehicle_in',
  IN_PROGRESS: 'in_progress',
  AWAITING_PARTS: 'awaiting_parts',
  AWAITING_APPROVAL: 'awaiting_approval',
  QC_CHECK: 'qc_check',
  READY_FOR_PICKUP: 'ready_for_pickup',
  INVOICED: 'invoiced',
  CLOSED: 'closed',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
  CARRY_OVER: 'carry_over',
};

export const TERMINAL_STATUSES = ['closed', 'cancelled'];

export const NON_TERMINAL_STATUSES = [
  'booked',
  'vehicle_in',
  'in_progress',
  'awaiting_parts',
  'awaiting_approval',
  'qc_check',
  'ready_for_pickup',
  'invoiced',
];

/**
 * Define allowed status transitions
 * From a status, which statuses can it transition to?
 */
export const STATUS_TRANSITIONS = {
  booked: ['vehicle_in', 'cancelled', 'carry_over'],
  vehicle_in: ['in_progress', 'awaiting_parts', 'cancelled', 'carry_over'],
  in_progress: ['awaiting_parts', 'awaiting_approval', 'qc_check', 'cancelled', 'carry_over'],
  awaiting_parts: ['in_progress', 'cancelled', 'carry_over'],
  awaiting_approval: ['in_progress', 'cancelled', 'carry_over'],
  qc_check: ['ready_for_pickup', 'in_progress', 'cancelled', 'carry_over'],
  ready_for_pickup: ['invoiced', 'cancelled', 'carry_over'],
  invoiced: ['closed', 'cancelled'],
  closed: [], // Terminal status - no transitions
  cancelled: [], // Terminal status - no transitions
  carry_over: ['vehicle_in', 'in_progress', 'cancelled'],
  overdue: [], // Computed status - not a real transition target
};

/**
 * Role-based permissions for status transitions
 * Which roles can initiate a transition from status A to status B?
 */
export const STATUS_TRANSITION_PERMISSIONS = {
  'booked->vehicle_in': ['admin', 'manager', 'service_advisor'],
  'booked->cancelled': ['admin', 'manager', 'service_advisor'],
  'booked->carry_over': ['admin', 'manager'],

  'vehicle_in->in_progress': ['admin', 'manager', 'technician'],
  'vehicle_in->awaiting_parts': ['admin', 'manager', 'technician'],
  'vehicle_in->cancelled': ['admin', 'manager', 'service_advisor'],
  'vehicle_in->carry_over': ['admin', 'manager'],

  'in_progress->awaiting_parts': ['admin', 'manager', 'technician'],
  'in_progress->awaiting_approval': ['admin', 'manager', 'technician'],
  'in_progress->qc_check': ['admin', 'manager', 'technician'],
  'in_progress->cancelled': ['admin', 'manager', 'service_advisor'],
  'in_progress->carry_over': ['admin', 'manager'],

  'awaiting_parts->in_progress': ['admin', 'manager', 'parts_coordinator'],
  'awaiting_parts->cancelled': ['admin', 'manager'],
  'awaiting_parts->carry_over': ['admin', 'manager'],

  'awaiting_approval->in_progress': ['admin', 'manager', 'service_advisor'],
  'awaiting_approval->cancelled': ['admin', 'manager', 'service_advisor'],
  'awaiting_approval->carry_over': ['admin', 'manager'],

  'qc_check->ready_for_pickup': ['admin', 'manager', 'service_advisor'],
  'qc_check->in_progress': ['admin', 'manager', 'technician'],
  'qc_check->cancelled': ['admin', 'manager'],
  'qc_check->carry_over': ['admin', 'manager'],

  'ready_for_pickup->invoiced': ['admin', 'manager', 'service_advisor'],
  'ready_for_pickup->cancelled': ['admin', 'manager'],
  'ready_for_pickup->carry_over': ['admin', 'manager'],

  'invoiced->closed': ['admin', 'manager', 'service_advisor'],
  'invoiced->cancelled': ['admin', 'manager'],

  'carry_over->vehicle_in': ['admin', 'manager', 'service_advisor'],
  'carry_over->in_progress': ['admin', 'manager', 'technician'],
  'carry_over->cancelled': ['admin', 'manager'],
};

/**
 * Check if a status transition is allowed
 */
export const isStatusTransitionAllowed = (currentStatus, targetStatus) => {
  if (currentStatus === targetStatus) {
    return false;
  }

  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
  if (!allowedTransitions) {
    return false;
  }

  return allowedTransitions.includes(targetStatus);
};

/**
 * Check if user role can make a transition
 */
export const canUserMakeTransition = (currentStatus, targetStatus, userRole) => {
  const transitionKey = `${currentStatus}->${targetStatus}`;
  const allowedRoles = STATUS_TRANSITION_PERMISSIONS[transitionKey];

  if (!allowedRoles) {
    return false;
  }

  return allowedRoles.includes(userRole);
};

/**
 * Get allowed target statuses for current status and user role
 */
export const getAllowedTransitions = (currentStatus, userRole) => {
  const allowedStatuses = STATUS_TRANSITIONS[currentStatus] || [];

  return allowedStatuses.filter((targetStatus) => {
    return canUserMakeTransition(currentStatus, targetStatus, userRole);
  });
};

/**
 * Check if a job is in a terminal status
 */
export const isTerminalStatus = (status) => {
  return TERMINAL_STATUSES.includes(status);
};

/**
 * Check if a job is in a non-terminal status
 */
export const isNonTerminalStatus = (status) => {
  return NON_TERMINAL_STATUSES.includes(status);
};

/**
 * Validate status transition with business rules
 */
export const validateStatusTransition = (currentStatus, targetStatus, job, userRole) => {
  const errors = [];
  const warnings = [];

  // Check if transition is allowed
  if (!isStatusTransitionAllowed(currentStatus, targetStatus)) {
    errors.push(`Cannot transition from ${currentStatus} to ${targetStatus}`);
  }

  // Check if user has permission
  if (!canUserMakeTransition(currentStatus, targetStatus, userRole)) {
    errors.push(`Your role (${userRole}) does not have permission to make this transition`);
  }

  // Cannot move from terminal status
  if (isTerminalStatus(currentStatus)) {
    errors.push(`Cannot transition from terminal status: ${currentStatus}`);
  }

  // Specific business rule validations
  if (targetStatus === 'closed') {
    if (job.paymentStatus !== 'paid' && job.paymentStatus !== 'insurance') {
      errors.push('Cannot close job without payment. Payment status must be "paid" or "insurance"');
    }
  }

  if (targetStatus === 'ready_for_pickup') {
    // Check if all blocking parts are installed
    const blockingParts = job.parts?.filter((p) => p.blockingPart && p.status !== 'installed') || [];
    if (blockingParts.length > 0) {
      errors.push(`Cannot mark ready for pickup. ${blockingParts.length} blocking part(s) not installed`);
    }
  }

  if (targetStatus === 'in_progress') {
    // Check if customer approval is still pending
    if (job.customerApprovalStatus === 'pending') {
      errors.push('Cannot start work. Waiting for customer approval');
    }
  }

  if (targetStatus === 'invoiced') {
    if (!job.finalCost || job.finalCost <= 0) {
      warnings.push('Invoice amount is not set. Please set final cost before invoicing');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Get human-readable status label
 */
export const getStatusLabel = (status) => {
  const labelMap = {
    booked: 'Booked',
    vehicle_in: 'Vehicle In',
    in_progress: 'In Progress',
    awaiting_parts: 'Awaiting Parts',
    awaiting_approval: 'Awaiting Approval',
    qc_check: 'QC Check',
    ready_for_pickup: 'Ready for Pickup',
    invoiced: 'Invoiced',
    closed: 'Closed',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
    carry_over: 'Carry Over',
  };

  return labelMap[status] || status;
};

/**
 * Get status description for tooltips
 */
export const getStatusDescription = (status) => {
  const descriptions = {
    booked: 'Appointment confirmed, vehicle not yet in',
    vehicle_in: 'Vehicle received at workshop',
    in_progress: 'Technician actively working',
    awaiting_parts: 'Paused, waiting for parts delivery',
    awaiting_approval: 'Waiting for customer to approve additional work/cost',
    qc_check: 'Work done, quality control in progress',
    ready_for_pickup: 'QC passed, customer can collect',
    invoiced: 'Invoice generated',
    closed: 'Payment received, job complete',
    overdue: 'Past estimated end time, not yet complete',
    cancelled: 'Job cancelled',
    carry_over: 'Rolled to next working day',
  };

  return descriptions[status] || '';
};

/**
 * Check if job is overdue
 * Computed in real time based on current time and job end time
 */
export const isJobOverdue = (job) => {
  if (!job || !job.date || !job.endTime) {
    return false;
  }

  if (isTerminalStatus(job.status)) {
    return false; // Terminal jobs are never overdue
  }

  const now = new Date();
  const jobEndDateTime = new Date(`${job.date}T${job.endTime}`);

  return now > jobEndDateTime;
};

/**
 * Get time until job deadline
 */
export const getTimeUntilDeadline = (job) => {
  if (!job || !job.date || !job.endTime) {
    return null;
  }

  const now = new Date();
  const jobEndDateTime = new Date(`${job.date}T${job.endTime}`);
  const diffMs = jobEndDateTime - now;

  if (diffMs < 0) {
    return { overdue: true, minutes: Math.abs(diffMs) / 60000 };
  }

  return { overdue: false, minutes: diffMs / 60000 };
};

/**
 * Get next logical status recommendation
 */
export const getNextRecommendedStatus = (currentStatus) => {
  const recommendations = {
    booked: 'vehicle_in',
    vehicle_in: 'in_progress',
    in_progress: 'qc_check',
    awaiting_parts: 'in_progress',
    awaiting_approval: 'in_progress',
    qc_check: 'ready_for_pickup',
    ready_for_pickup: 'invoiced',
    invoiced: 'closed',
  };

  return recommendations[currentStatus] || null;
};

/**
 * Get all possible status transitions (for UI display)
 */
export const getAllPossibleStatuses = () => {
  return Object.values(JOB_STATUSES);
};

/**
 * Format status for log/history
 */
export const formatStatusHistoryEntry = (entry) => {
  if (!entry || !entry.status) {
    return '';
  }

  const statusLabel = getStatusLabel(entry.status);
  const time = entry.changedAt ? new Date(entry.changedAt).toLocaleString() : 'Unknown time';
  const note = entry.note ? ` (${entry.note})` : '';

  return `${statusLabel} - ${time}${note}`;
};

export default {
  JOB_STATUSES,
  TERMINAL_STATUSES,
  NON_TERMINAL_STATUSES,
  STATUS_TRANSITIONS,
  STATUS_TRANSITION_PERMISSIONS,
  isStatusTransitionAllowed,
  canUserMakeTransition,
  getAllowedTransitions,
  isTerminalStatus,
  isNonTerminalStatus,
  validateStatusTransition,
  getStatusLabel,
  getStatusDescription,
  isJobOverdue,
  getTimeUntilDeadline,
  getNextRecommendedStatus,
  getAllPossibleStatuses,
  formatStatusHistoryEntry,
};
