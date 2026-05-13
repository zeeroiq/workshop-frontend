import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { getCapacityColor } from '@/utils/colorMapping';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Capacity Bar Component
 * Shows bay/technician utilisation as a colored bar
 * Colors: green <80%, amber 80-95%, red >95%, deep red 100%
 *
 * @component
 * @param {number} percentage - Utilisation percentage (0-100)
 * @param {number} jobCount - Number of jobs in this slot
 * @param {string} label - Optional custom label
 * @param {string} className - Additional CSS classes
 * @param {boolean} showLabel - Show percentage label
 * @param {boolean} showTooltip - Show tooltip on hover
 * @returns {React.ReactElement}
 */
export const CapacityBar = ({
  percentage = 0,
  jobCount = 0,
  label = null,
  className = '',
  showLabel = true,
  showTooltip = true,
  size = 'md', // 'sm' | 'md' | 'lg'
}) => {
  const capacityColor = getCapacityColor(percentage);
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const tooltipText = label || `${normalizedPercentage.toFixed(0)}% occupied${jobCount > 0 ? ` (${jobCount} job${jobCount !== 1 ? 's' : ''})` : ''}`;

  const barContent = (
    <div className={cn('w-full bg-gray-200 rounded-full overflow-hidden', sizeClasses[size], className)}>
      <div
        className="h-full rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${normalizedPercentage}%`,
          backgroundColor: capacityColor.color,
        }}
        role="progressbar"
        aria-valuenow={normalizedPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Capacity: ${normalizedPercentage.toFixed(0)}%`}
      />
    </div>
  );

  const statusLabel = (() => {
    if (percentage >= 100) return 'Full';
    if (percentage >= 95) return 'High';
    if (percentage >= 80) return 'Caution';
    return 'Good';
  })();

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              {barContent}
              {showLabel && (
                <span className="text-xs font-medium whitespace-nowrap min-w-fit">
                  {normalizedPercentage.toFixed(0)}%
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
            <p className="text-xs text-gray-400">{statusLabel}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {barContent}
      {showLabel && (
        <span className="text-xs font-medium whitespace-nowrap min-w-fit">
          {normalizedPercentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
};

/**
 * Inline Capacity Bar (without tooltip, direct styling)
 */
export const CapacityBarInline = ({
  percentage = 0,
  jobCount = 0,
  showLabel = true,
  size = 'md',
}) => {
  const capacityColor = getCapacityColor(percentage);
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));

  const sizeStyles = {
    sm: { height: '6px' },
    md: { height: '8px' },
    lg: { height: '12px' },
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
      title={`${normalizedPercentage.toFixed(0)}% occupied${jobCount > 0 ? ` (${jobCount} jobs)` : ''}`}
    >
      <div
        style={{
          width: '100%',
          backgroundColor: '#d1d5db',
          borderRadius: '9999px',
          overflow: 'hidden',
          ...sizeStyles[size],
        }}
      >
        <div
          style={{
            width: `${normalizedPercentage}%`,
            backgroundColor: capacityColor.color,
            height: '100%',
            borderRadius: '9999px',
            transition: 'width 0.3s ease-out',
          }}
        />
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            minWidth: '2.5rem',
            textAlign: 'right',
          }}
        >
          {normalizedPercentage.toFixed(0)}%
        </span>
      )}
    </div>
  );
};

export default CapacityBar;
