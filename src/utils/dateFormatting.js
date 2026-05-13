import { format, parse, isToday, isSameDay, startOfDay, endOfDay, addDays, subDays, startOfWeek, endOfWeek, differenceInMinutes } from 'date-fns';
import { enIN } from 'date-fns/locale';

const TIMEZONE = 'Asia/Kolkata';

/**
 * Format a date to ISO format (YYYY-MM-DD)
 */
export const toISODate = (date) => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return format(new Date(date), 'yyyy-MM-dd');
};

/**
 * Parse ISO date string to Date object
 */
export const fromISODate = (dateString) => {
  if (!dateString) return null;
  return parse(dateString, 'yyyy-MM-dd', new Date());
};

/**
 * Format date for display: "Monday, 11 May 2026"
 */
export const formatDateFull = (date) => {
  if (!date) return null;
  return format(new Date(date), 'EEEE, d MMMM yyyy', { locale: enIN });
};

/**
 * Format date short: "11 May 2026"
 */
export const formatDateShort = (date) => {
  if (!date) return null;
  return format(new Date(date), 'd MMM yyyy', { locale: enIN });
};

/**
 * Format date minimal: "11 May" (for day/week headers)
 */
export const formatDateMinimal = (date) => {
  if (!date) return null;
  return format(new Date(date), 'd MMM', { locale: enIN });
};

/**
 * Format time: "08:00" or "08:00 AM"
 */
export const formatTime = (timeString, format24 = true) => {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(':');
  
  if (format24) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  let hour = parseInt(hours);
  const meridiem = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${meridiem}`;
};

/**
 * Format time range: "08:00 – 10:00"
 */
export const formatTimeRange = (startTime, endTime, format24 = true) => {
  if (!startTime || !endTime) return null;
  const start = formatTime(startTime, format24);
  const end = formatTime(endTime, format24);
  return `${start} – ${end}`;
};

/**
 * Format date range: "11–16 May 2026" or "Mon–Sat"
 */
export const formatDateRange = (startDate, endDate, minimal = false) => {
  if (!startDate || !endDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (minimal) {
    // Return day abbreviations: "Mon–Sat"
    const startDay = format(start, 'EEE', { locale: enIN });
    const endDay = format(end, 'EEE', { locale: enIN });
    return `${startDay}–${endDay}`;
  }
  
  // Return date range: "11–16 May 2026"
  const startFormatted = format(start, 'd');
  const endFormatted = format(end, 'd MMM yyyy', { locale: enIN });
  return `${startFormatted}–${endFormatted}`;
};

/**
 * Format week label: "Week 20 — 11–16 May 2026"
 */
export const formatWeekLabel = (date) => {
  if (!date) return null;
  const dateObj = new Date(date);
  const weekStart = startOfWeek(dateObj, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(dateObj, { weekStartsOn: 1 });
  
  // Calculate week number
  const firstDay = new Date(dateObj.getFullYear(), 0, 1);
  const weekNum = Math.ceil((differenceInMinutes(dateObj, firstDay) / (1440 * 7)) + 1);
  
  const range = formatDateRange(weekStart, weekEnd);
  return `Week ${weekNum} — ${range}`;
};

/**
 * Check if date is today
 */
export const isDateToday = (date) => {
  if (!date) return false;
  return isToday(new Date(date));
};

/**
 * Check if dates are same day
 */
export const isSameDateDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return isSameDay(new Date(date1), new Date(date2));
};

/**
 * Get next working day (skips weekends, can be configured)
 */
export const getNextWorkingDay = (date, workingDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']) => {
  if (!date) return null;
  
  let nextDate = addDays(new Date(date), 1);
  const dayMap = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
  
  while (!workingDays.includes(dayMap[nextDate.getDay()])) {
    nextDate = addDays(nextDate, 1);
  }
  
  return nextDate;
};

/**
 * Get previous working day
 */
export const getPreviousWorkingDay = (date, workingDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat']) => {
  if (!date) return null;
  
  let prevDate = subDays(new Date(date), 1);
  const dayMap = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
  
  while (!workingDays.includes(dayMap[prevDate.getDay()])) {
    prevDate = subDays(prevDate, 1);
  }
  
  return prevDate;
};

/**
 * Calculate duration between two times in minutes
 * E.g., "08:00" to "10:00" => 120 minutes
 */
export const calculateDurationMinutes = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  
  const [startHours, startMins] = startTime.split(':').map(Number);
  const [endHours, endMins] = endTime.split(':').map(Number);
  
  const startTotalMins = startHours * 60 + startMins;
  const endTotalMins = endHours * 60 + endMins;
  
  return endTotalMins - startTotalMins;
};

/**
 * Format duration in minutes to readable format
 * E.g., 120 => "2h" or "2h 30m"
 */
export const formatDuration = (minutes, short = true) => {
  if (!minutes || minutes < 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (short) {
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  }
  
  if (hours > 0 && mins > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${mins} minute${mins > 1 ? 's' : ''}`;
};

/**
 * Get relative date label (Today, Tomorrow, Yesterday, date)
 */
export const getRelativeDateLabel = (date) => {
  if (!date) return null;
  
  const dateObj = new Date(date);
  const today = new Date();
  
  if (isSameDay(dateObj, today)) return 'Today';
  if (isSameDay(dateObj, addDays(today, 1))) return 'Tomorrow';
  if (isSameDay(dateObj, subDays(today, 1))) return 'Yesterday';
  
  return formatDateShort(dateObj);
};

/**
 * Get all days in a week (starting Monday)
 */
export const getWeekDays = (date) => {
  if (!date) return [];
  
  const dateObj = new Date(date);
  const weekStart = startOfWeek(dateObj, { weekStartsOn: 1 });
  
  return Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));
};

/**
 * Get all working hours in a day
 */
export const getWorkingHours = (openingTime = '08:00', closingTime = '18:00') => {
  const [openHour] = openingTime.split(':').map(Number);
  const [closeHour] = closingTime.split(':').map(Number);
  
  return Array.from({ length: closeHour - openHour }, (_, i) => {
    const hour = openHour + i;
    return `${String(hour).padStart(2, '0')}:00`;
  });
};

/**
 * Parse time string to minutes since midnight
 */
export const timeToMinutes = (timeString) => {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * Convert minutes since midnight to time string
 */
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Get position in day as percentage (for current time indicator)
 * E.g., 12:00 noon in 08:00-18:00 day => 40%
 */
export const getTimePositionPercent = (time, openingTime = '08:00', closingTime = '18:00') => {
  if (!time) return 0;
  
  const totalMins = timeToMinutes(closingTime) - timeToMinutes(openingTime);
  const timeMins = timeToMinutes(time) - timeToMinutes(openingTime);
  
  return (timeMins / totalMins) * 100;
};

export default {
  toISODate,
  fromISODate,
  formatDateFull,
  formatDateShort,
  formatDateMinimal,
  formatTime,
  formatTimeRange,
  formatDateRange,
  formatWeekLabel,
  isDateToday,
  isSameDateDay,
  getNextWorkingDay,
  getPreviousWorkingDay,
  calculateDurationMinutes,
  formatDuration,
  getRelativeDateLabel,
  getWeekDays,
  getWorkingHours,
  timeToMinutes,
  minutesToTime,
  getTimePositionPercent,
};
