import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { getStatusColor } from '@/utils/colorMapping';
import { formatTime, formatDuration } from '@/utils/dateFormatting';
import { StatusBadgeInline } from './status-badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Job Card Component
 * Renders a job as a colored pill/block in the calendar view
 * Supports drag-drop, click handlers, and status-based styling
 *
 * @component
 * @param {Object} job - Job object with id, title, startTime, endTime, status, etc.
 * @param {function} onClick - Click handler
 * @param {function} onContextMenu - Right-click context menu handler
 * @param {boolean} draggable - Enable drag-drop
 * @param {function} onDragStart - Drag start handler
 * @param {string} className - Additional CSS classes
 * @param {boolean} showTooltip - Show tooltip on hover
 * @returns {React.ReactElement}
 */
export const JobCard = ({
  job,
  onClick = null,
  onContextMenu = null,
  draggable = false,
  onDragStart = null,
  className = '',
  showTooltip = true,
  compact = false,
  isOverdue = false,
  isCarryOver = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const statusColor = getStatusColor(job.status);
  const durationMins = job.estimatedDuration || 60;
  const durationStr = formatDuration(durationMins, true);

  const backgroundColor = isOverdue ? '#FCEBEB' : statusColor.bg;
  const textColor = isOverdue ? '#791F1F' : statusColor.text;

  const baseClasses = cn(
    'rounded-lg p-2.5 cursor-pointer transition-all duration-200',
    'border border-opacity-20 group',
    draggable && 'cursor-grab active:cursor-grabbing',
    isDragging && 'opacity-50 shadow-lg',
    className
  );

  const handleDragStart = (e) => {
    setIsDragging(true);
    if (onDragStart) {
      onDragStart(e, job);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const tooltipContent = (
    <div className="space-y-1 text-sm">
      <p className="font-semibold">{job.id}</p>
      <p>{job.title}</p>
      {job.vehicle && (
        <p className="text-xs">
          {job.vehicle.make} {job.vehicle.model}
        </p>
      )}
      {job.customer && <p className="text-xs">{job.customer.name}</p>}
      <p className="text-xs">
        {formatTime(job.startTime)} – {formatTime(job.endTime)} ({durationStr})
      </p>
    </div>
  );

  const cardContent = (
    <div
      className={baseClasses}
      style={{
        backgroundColor,
        borderColor: textColor,
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      role="button"
      tabIndex={0}
      title={`${job.id}: ${job.title}`}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          onClick(e);
        }
      }}
    >
      {/* Carry-over badge */}
      {isCarryOver && (
        <div className="absolute top-1 right-1 text-xs font-bold opacity-60">
          ↩
        </div>
      )}

      {/* WO Number */}
      <div className="text-xs font-bold opacity-75 mb-1">{job.id}</div>

      {/* Job Title */}
      <div
        className="font-semibold text-sm truncate"
        style={{ color: textColor }}
      >
        {job.title}
      </div>

      {/* Vehicle Info */}
      {job.vehicle && (
        <div className="text-xs opacity-70 truncate">
          {job.vehicle.make} {job.vehicle.model}
        </div>
      )}

      {/* Hatched pattern for parts-hold */}
      {job.status === 'awaiting_parts' && (
        <div
          className="absolute inset-0 rounded-lg opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255, 255, 255, 0.5) 2px, rgba(255, 255, 255, 0.5) 4px)',
          }}
        />
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
          <TooltipContent side="top">{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
};

/**
 * Job Card Inline (with direct styling, no Radix dependencies)
 */
export const JobCardInline = ({
  job,
  onClick = null,
  onContextMenu = null,
  isOverdue = false,
  isCarryOver = false,
}) => {
  const statusColor = getStatusColor(job.status);
  const durationMins = job.estimatedDuration || 60;
  const durationStr = formatDuration(durationMins, true);

  const backgroundColor = isOverdue ? '#FCEBEB' : statusColor.bg;
  const textColor = isOverdue ? '#791F1F' : statusColor.text;

  return (
    <div
      style={{
        borderRadius: '0.5rem',
        padding: '0.625rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: `1px solid ${textColor}`,
        backgroundColor,
        color: textColor,
        position: 'relative',
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      title={`${job.id}: ${job.title} - ${formatTime(job.startTime)} to ${formatTime(job.endTime)}`}
    >
      {/* Carry-over badge */}
      {isCarryOver && (
        <div
          style={{
            position: 'absolute',
            top: '0.25rem',
            right: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            opacity: 0.6,
          }}
        >
          ↩
        </div>
      )}

      {/* WO Number */}
      <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', opacity: 0.75 }}>
        {job.id}
      </div>

      {/* Job Title */}
      <div
        style={{
          fontWeight: 600,
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {job.title}
      </div>

      {/* Vehicle Info */}
      {job.vehicle && (
        <div style={{ fontSize: '0.75rem', opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {job.vehicle.make} {job.vehicle.model}
        </div>
      )}

      {/* Hatched pattern overlay for parts-hold */}
      {job.status === 'awaiting_parts' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '0.5rem',
            opacity: 0.2,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255, 255, 255, 0.5) 2px, rgba(255, 255, 255, 0.5) 4px)',
          }}
        />
      )}
    </div>
  );
};

export default JobCard;
