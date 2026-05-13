import React from 'react';
import { cn } from '@/lib/utils';
import { getStatusColor, getStatusLabel } from '@/utils/colorMapping';

/**
 * Status Badge Component
 * Displays job status as a colored pill with text and optional icon
 * 
 * @component
 * @param {string} status - Job status (e.g., 'in_progress', 'awaiting_parts')
 * @param {React.ReactNode} icon - Optional icon to display before text
 * @param {string} className - Additional CSS classes
 * @param {boolean} compact - If true, show smaller badge
 * @param {boolean} showBorder - If true, add border
 * @returns {React.ReactElement}
 */
export const StatusBadge = ({
  status,
  icon = null,
  className = '',
  compact = false,
  showBorder = false,
  variant = 'pill', // 'pill' | 'outline' | 'subtle'
}) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  const baseClasses = cn(
    'inline-flex items-center gap-1.5 font-medium whitespace-nowrap',
    compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
    className
  );

  const variantClasses = {
    pill: cn(
      'rounded-full',
      `bg-[${color.bg}] text-[${color.text}]`,
      color.tailwind.bg,
      color.tailwind.text
    ),
    outline: cn(
      'rounded border',
      `border-[${color.text}]`,
      `text-[${color.text}]`,
      'bg-transparent',
      color.tailwind.border,
      color.tailwind.text
    ),
    subtle: cn(
      'rounded',
      color.tailwind.bg,
      color.tailwind.text
    ),
  };

  const borderClasses = showBorder ? cn('border', color.tailwind.border) : '';

  return (
    <span
      className={cn(baseClasses, variantClasses[variant], borderClasses)}
      style={variant === 'pill' ? {
        backgroundColor: color.bg,
        color: color.text,
      } : {}}
      role="status"
      aria-label={`Status: ${label}`}
      title={label}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};

/**
 * Status Badge with inline style (for more reliable rendering)
 */
export const StatusBadgeInline = ({
  status,
  icon = null,
  className = '',
  compact = false,
  showBorder = false,
}) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    borderRadius: '9999px',
    padding: compact ? '0.25rem 0.5rem' : '0.375rem 0.75rem',
    fontSize: compact ? '0.75rem' : '0.875rem',
    backgroundColor: color.bg,
    color: color.text,
    ...(showBorder && {
      border: `1px solid ${color.text}`,
    }),
  };

  return (
    <span
      className={className}
      style={baseStyle}
      role="status"
      aria-label={`Status: ${label}`}
      title={label}
    >
      {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
