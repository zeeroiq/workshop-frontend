/**
 * Conflict Detection Utilities
 * Detects time and resource conflicts for job scheduling
 */

/**
 * Check if two time ranges overlap
 * newStart < existingEnd && newEnd > existingStart
 */
export const timeRangesOverlap = (newStart, newEnd, existingStart, existingEnd) => {
  if (!newStart || !newEnd || !existingStart || !existingEnd) {
    return false;
  }

  const newStartMins = timeStringToMinutes(newStart);
  const newEndMins = timeStringToMinutes(newEnd);
  const existingStartMins = timeStringToMinutes(existingStart);
  const existingEndMins = timeStringToMinutes(existingEnd);

  return newStartMins < existingEndMins && newEndMins > existingStartMins;
};

/**
 * Convert time string "HH:MM" to minutes since midnight
 */
const timeStringToMinutes = (timeString) => {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * Detect bay conflicts for a specific date
 * Returns array of conflicting jobs
 */
export const detectBayConflict = (bayId, date, startTime, endTime, existingJobs, excludeJobId = null) => {
  if (!bayId || !date || !startTime || !endTime) {
    return [];
  }

  const conflicts = existingJobs.filter((job) => {
    // Skip if checking against same job
    if (excludeJobId && job.id === excludeJobId) {
      return false;
    }

    // Must be same bay and date
    if (job.bayId !== bayId || job.date !== date) {
      return false;
    }

    // Check for time overlap
    return timeRangesOverlap(startTime, endTime, job.startTime, job.endTime);
  });

  return conflicts;
};

/**
 * Detect technician conflicts (same tech assigned to overlapping jobs on same day)
 */
export const detectTechnicianConflict = (technicianId, date, startTime, endTime, existingJobs, excludeJobId = null) => {
  if (!technicianId || !date || !startTime || !endTime) {
    return [];
  }

  const conflicts = existingJobs.filter((job) => {
    if (excludeJobId && job.id === excludeJobId) {
      return false;
    }

    if (job.technicianId !== technicianId || job.date !== date) {
      return false;
    }

    return timeRangesOverlap(startTime, endTime, job.startTime, job.endTime);
  });

  return conflicts;
};

/**
 * Check if technician has leave on date
 */
export const checkTechnicianLeave = (technician, date) => {
  if (!technician || !technician.leaveSchedule || !date) {
    return null;
  }

  const leaveDay = technician.leaveSchedule.find((leave) => leave.date === date);
  return leaveDay || null;
};

/**
 * Check if technician has required skills for job
 */
export const checkTechnicianSkills = (technician, jobSkillRequired) => {
  if (!technician || !jobSkillRequired) {
    return true; // If no requirement, any tech can do it
  }

  if (jobSkillRequired === 'general') {
    return true; // Any technician can do general work
  }

  if (!technician.specialisms || !Array.isArray(technician.specialisms)) {
    return false; // Tech has no specialisms but job requires one
  }

  // Map job skill requirements to technician specialisms
  const skillMapping = {
    ev_certified: 'ev_certified',
    diesel: 'diesel',
    bodywork: 'bodywork',
    specialist: 'specialist',
  };

  const requiredSpecialism = skillMapping[jobSkillRequired];
  return requiredSpecialism ? technician.specialisms.includes(requiredSpecialism) : true;
};

/**
 * Check if technician is available (not on leave, on duty hours)
 */
export const isTechnicianAvailable = (technician, date, startTime, endTime) => {
  if (!technician || !date || !startTime || !endTime) {
    return false;
  }

  // Check leave
  const leaveDay = checkTechnicianLeave(technician, date);
  if (leaveDay && leaveDay.approved) {
    return false;
  }

  // Check shift hours
  const startMins = timeStringToMinutes(startTime);
  const endMins = timeStringToMinutes(endTime);
  const shiftStartMins = timeStringToMinutes(technician.shiftStart);
  const shiftEndMins = timeStringToMinutes(technician.shiftEnd);

  return startMins >= shiftStartMins && endMins <= shiftEndMins;
};

/**
 * Check if bay is available during time slot
 */
export const isBayAvailable = (bay, date, startTime, endTime, existingJobs) => {
  if (!bay || !date || !startTime || !endTime) {
    return false;
  }

  if (!bay.isActive) {
    return false;
  }

  const conflicts = detectBayConflict(bay.id, date, startTime, endTime, existingJobs);
  return conflicts.length === 0;
};

/**
 * Check if bay has required capabilities for job
 */
export const checkBayCapabilities = (bay, jobSkillRequired) => {
  if (!bay || !jobSkillRequired) {
    return true;
  }

  if (jobSkillRequired === 'general') {
    return true;
  }

  if (!bay.capabilities || !Array.isArray(bay.capabilities)) {
    return false;
  }

  // Map job requirements to bay capabilities
  const capabilityMapping = {
    ev_certified: 'ev_certified',
    diesel: 'diesel',
    bodywork: 'bodywork',
    alignment: 'alignment_machine',
    diagnostics: 'diagnostic_scanner',
  };

  const requiredCapability = capabilityMapping[jobSkillRequired];
  return requiredCapability ? bay.capabilities.includes(requiredCapability) : true;
};

/**
 * Validate job scheduling (comprehensive conflict check)
 * Returns object { isValid, conflicts: [], errors: [] }
 */
export const validateJobScheduling = (job, existingJobs, bays, technicians, excludeJobId = null) => {
  const conflicts = [];
  const errors = [];

  if (!job || !job.bayId || !job.technicianId || !job.date || !job.startTime || !job.endTime) {
    errors.push('Missing required job fields (bayId, technicianId, date, startTime, endTime)');
    return { isValid: false, conflicts, errors };
  }

  // Find bay and technician
  const bay = bays.find((b) => b.id === job.bayId);
  const technician = technicians.find((t) => t.id === job.technicianId);

  if (!bay) {
    errors.push(`Bay not found: ${job.bayId}`);
  }

  if (!technician) {
    errors.push(`Technician not found: ${job.technicianId}`);
  }

  if (errors.length > 0) {
    return { isValid: false, conflicts, errors };
  }

  // Check bay conflicts
  const bayConflicts = detectBayConflict(job.bayId, job.date, job.startTime, job.endTime, existingJobs, excludeJobId);
  if (bayConflicts.length > 0) {
    conflicts.push({
      type: 'bay_conflict',
      message: `Bay ${bay.name} is already occupied during this time`,
      conflictingJobs: bayConflicts,
    });
  }

  // Check technician conflicts
  const techConflicts = detectTechnicianConflict(
    job.technicianId,
    job.date,
    job.startTime,
    job.endTime,
    existingJobs,
    excludeJobId
  );
  if (techConflicts.length > 0) {
    conflicts.push({
      type: 'technician_conflict',
      message: `${technician.name} is already assigned during this time`,
      conflictingJobs: techConflicts,
    });
  }

  // Check technician leave
  const leave = checkTechnicianLeave(technician, job.date);
  if (leave && leave.approved) {
    errors.push(`${technician.name} is on ${leave.type} leave on ${job.date}`);
  }

  // Check technician skills
  if (!checkTechnicianSkills(technician, job.skillRequired)) {
    errors.push(`${technician.name} does not have required skill: ${job.skillRequired}`);
  }

  // Check bay capabilities
  if (!checkBayCapabilities(bay, job.skillRequired)) {
    errors.push(`Bay ${bay.name} does not have required capability: ${job.skillRequired}`);
  }

  // Check time validity
  const startMins = timeStringToMinutes(job.startTime);
  const endMins = timeStringToMinutes(job.endTime);
  if (startMins >= endMins) {
    errors.push('Start time must be before end time');
  }

  // Check minimum duration (30 minutes)
  const durationMins = endMins - startMins;
  if (durationMins < 30) {
    errors.push('Job duration must be at least 30 minutes');
  }

  // Check shift hours
  if (!isTechnicianAvailable(technician, job.date, job.startTime, job.endTime)) {
    errors.push(`Job time is outside ${technician.name}'s shift (${technician.shiftStart}–${technician.shiftEnd})`);
  }

  const isValid = conflicts.length === 0 && errors.length === 0;

  return { isValid, conflicts, errors };
};

/**
 * Find available slots for a job
 */
export const findAvailableSlots = (date, duration, bay, technician, existingJobs, openingTime = '08:00', closingTime = '18:00') => {
  if (!date || !duration || !bay || !technician) {
    return [];
  }

  const slots = [];
  const durationMins = duration;
  const openingMins = timeStringToMinutes(openingTime);
  const closingMins = timeStringToMinutes(closingTime);
  const shiftStartMins = timeStringToMinutes(technician.shiftStart);
  const shiftEndMins = timeStringToMinutes(technician.shiftEnd);

  // Calculate effective working hours (intersection of shop hours and tech shift)
  const startMins = Math.max(openingMins, shiftStartMins);
  const endMins = Math.min(closingMins, shiftEndMins);

  // Check 30-minute intervals
  for (let slotStartMins = startMins; slotStartMins + durationMins <= endMins; slotStartMins += 30) {
    const slotEndMins = slotStartMins + durationMins;
    const slotStart = minutesToTimeString(slotStartMins);
    const slotEnd = minutesToTimeString(slotEndMins);

    // Check for conflicts
    const bayConflicts = detectBayConflict(bay.id, date, slotStart, slotEnd, existingJobs);
    const techConflicts = detectTechnicianConflict(technician.id, date, slotStart, slotEnd, existingJobs);

    if (bayConflicts.length === 0 && techConflicts.length === 0) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
        duration: durationMins,
      });
    }
  }

  return slots;
};

/**
 * Convert minutes since midnight to time string "HH:MM"
 */
const minutesToTimeString = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

export default {
  timeRangesOverlap,
  detectBayConflict,
  detectTechnicianConflict,
  checkTechnicianLeave,
  checkTechnicianSkills,
  isTechnicianAvailable,
  isBayAvailable,
  checkBayCapabilities,
  validateJobScheduling,
  findAvailableSlots,
};
