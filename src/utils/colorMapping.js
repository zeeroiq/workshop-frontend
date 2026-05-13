/**
 * Status to Color Mapping
 * Per design tokens from requirements section 14
 */

export const STATUS_COLORS = {
  in_progress: {
    bg: '#FAEEDA',
    text: '#633806',
    label: 'In Progress',
    tailwind: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-200',
    },
  },
  awaiting_parts: {
    bg: '#E6F1FB',
    text: '#0C447C',
    label: 'Awaiting Parts',
    tailwind: {
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      border: 'border-blue-200',
    },
  },
  ready_for_pickup: {
    bg: '#EAF3DE',
    text: '#27500A',
    label: 'Ready for Pickup',
    tailwind: {
      bg: 'bg-green-50',
      text: 'text-green-900',
      border: 'border-green-200',
    },
  },
  overdue: {
    bg: '#FCEBEB',
    text: '#791F1F',
    label: 'Overdue',
    tailwind: {
      bg: 'bg-red-50',
      text: 'text-red-900',
      border: 'border-red-200',
    },
  },
  booked: {
    bg: '#F1EFE8',
    text: '#444441',
    label: 'Booked',
    tailwind: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-300',
    },
  },
  qc_check: {
    bg: '#EEEDFE',
    text: '#3C3489',
    label: 'QC Check',
    tailwind: {
      bg: 'bg-purple-50',
      text: 'text-purple-900',
      border: 'border-purple-200',
    },
  },
  carry_over: {
    bg: '#FFF4E5',
    text: '#6B3E00',
    label: 'Carry Over',
    tailwind: {
      bg: 'bg-orange-50',
      text: 'text-orange-900',
      border: 'border-orange-200',
    },
  },
  cancelled: {
    bg: '#F5F5F5',
    text: '#888888',
    label: 'Cancelled',
    tailwind: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
    },
  },
  vehicle_in: {
    bg: '#E8F4F8',
    text: '#1A5C7A',
    label: 'Vehicle In',
    tailwind: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-900',
      border: 'border-cyan-200',
    },
  },
  awaiting_approval: {
    bg: '#FEF3C7',
    text: '#78350F',
    label: 'Awaiting Approval',
    tailwind: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-900',
      border: 'border-yellow-200',
    },
  },
  invoiced: {
    bg: '#DDD6FE',
    text: '#3730A3',
    label: 'Invoiced',
    tailwind: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-900',
      border: 'border-indigo-200',
    },
  },
  closed: {
    bg: '#D1FAE5',
    text: '#065F46',
    label: 'Closed',
    tailwind: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-900',
      border: 'border-emerald-200',
    },
  },
};

/**
 * Capacity utilisation bar colors
 */
export const CAPACITY_COLORS = {
  low: {
    color: '#639922',
    label: 'Good',
    range: '0–79%',
    tailwind: 'bg-lime-600',
  },
  medium: {
    color: '#EF9F27',
    label: 'Caution',
    range: '80–94%',
    tailwind: 'bg-amber-500',
  },
  high: {
    color: '#E24B4A',
    label: 'High',
    range: '95–99%',
    tailwind: 'bg-red-500',
  },
  full: {
    color: '#A32D2D',
    label: 'Full',
    range: '100%',
    tailwind: 'bg-red-700',
  },
};

/**
 * Get status color object
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || STATUS_COLORS.booked;
};

/**
 * Get status background color (hex)
 */
export const getStatusBgColor = (status) => {
  return getStatusColor(status)?.bg || '#F1EFE8';
};

/**
 * Get status text color (hex)
 */
export const getStatusTextColor = (status) => {
  return getStatusColor(status)?.text || '#444441';
};

/**
 * Get status label
 */
export const getStatusLabel = (status) => {
  return getStatusColor(status)?.label || status;
};

/**
 * Get status Tailwind classes (bg + text)
 */
export const getStatusTailwindClasses = (status) => {
  const color = getStatusColor(status);
  return `${color.tailwind.bg} ${color.tailwind.text}`;
};

/**
 * Get status border classes
 */
export const getStatusBorderClasses = (status) => {
  const color = getStatusColor(status);
  return color.tailwind.border || 'border-gray-200';
};

/**
 * Get capacity color based on utilisation percentage
 */
export const getCapacityColor = (percentage) => {
  if (percentage >= 100) return CAPACITY_COLORS.full;
  if (percentage >= 95) return CAPACITY_COLORS.high;
  if (percentage >= 80) return CAPACITY_COLORS.medium;
  return CAPACITY_COLORS.low;
};

/**
 * Get capacity color (hex) based on percentage
 */
export const getCapacityColorHex = (percentage) => {
  return getCapacityColor(percentage).color;
};

/**
 * Get capacity Tailwind class based on percentage
 */
export const getCapacityTailwindClass = (percentage) => {
  return getCapacityColor(percentage).tailwind;
};

/**
 * Get all available status colors for mapping
 */
export const getAllStatusColors = () => {
  return Object.entries(STATUS_COLORS).map(([status, colors]) => ({
    status,
    ...colors,
  }));
};

/**
 * Generate inline style for status color
 */
export const getStatusStyle = (status) => {
  const color = getStatusColor(status);
  return {
    backgroundColor: color.bg,
    color: color.text,
  };
};

/**
 * Get contrasting text color for better readability
 */
export const getContrastingTextColor = (bgColor) => {
  // Simple luminance calculation
  const rgb = parseInt(bgColor.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export default {
  STATUS_COLORS,
  CAPACITY_COLORS,
  getStatusColor,
  getStatusBgColor,
  getStatusTextColor,
  getStatusLabel,
  getStatusTailwindClasses,
  getStatusBorderClasses,
  getCapacityColor,
  getCapacityColorHex,
  getCapacityTailwindClass,
  getAllStatusColors,
  getStatusStyle,
  getContrastingTextColor,
};
