import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatDateFull, formatWeekLabel, addDays, subDays } from '@/utils/dateFormatting';

/**
 * Date Navigator Component
 * Handles date navigation with arrow buttons and "Today" button
 * Supports day, week, and month navigation
 *
 * @component
 * @param {string} currentDate - Current date being viewed (YYYY-MM-DD)
 * @param {function} onDateChange - Callback when date changes
 * @param {string} viewType - View type ('day' | 'week' | 'month')
 * @param {string} className - Additional CSS classes
 * @returns {React.ReactElement}
 */
export const DateNavigator = ({
  currentDate,
  onDateChange,
  viewType = 'day',
  className = '',
}) => {
  const today = new Date().toISOString().split('T')[0];

  const handlePrevious = () => {
    let newDate;
    if (viewType === 'day') {
      newDate = subDays(new Date(currentDate), 1).toISOString().split('T')[0];
    } else if (viewType === 'week') {
      newDate = subDays(new Date(currentDate), 7).toISOString().split('T')[0];
    } else if (viewType === 'month') {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - 1);
      newDate = date.toISOString().split('T')[0];
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    let newDate;
    if (viewType === 'day') {
      newDate = addDays(new Date(currentDate), 1).toISOString().split('T')[0];
    } else if (viewType === 'week') {
      newDate = addDays(new Date(currentDate), 7).toISOString().split('T')[0];
    } else if (viewType === 'month') {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() + 1);
      newDate = date.toISOString().split('T')[0];
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(today);
  };

  // Get display label
  let dateLabel = formatDateFull(currentDate);
  if (viewType === 'week') {
    dateLabel = formatWeekLabel(currentDate);
  } else if (viewType === 'month') {
    const date = new Date(currentDate);
    dateLabel = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Previous Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        title={`Previous ${viewType}`}
        aria-label={`Previous ${viewType}`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Date Label */}
      <div className="min-w-fit text-center">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-white truncate max-w-xs">
          {dateLabel}
        </h2>
        {currentDate !== today && (
          <p className="text-xs text-gray-500">
            {currentDate === today ? 'Today' : 'Not today'}
          </p>
        )}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        title={`Next ${viewType}`}
        aria-label={`Next ${viewType}`}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Today Button */}
      {currentDate !== today && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          title="Go to today"
          className="ml-2"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Today
        </Button>
      )}
    </div>
  );
};

/**
 * Inline Date Navigator (with direct styling)
 */
export const DateNavigatorInline = ({
  currentDate,
  onDateChange,
  viewType = 'day',
}) => {
  const today = new Date().toISOString().split('T')[0];

  const handlePrevious = () => {
    let newDate;
    if (viewType === 'day') {
      newDate = subDays(new Date(currentDate), 1).toISOString().split('T')[0];
    } else if (viewType === 'week') {
      newDate = subDays(new Date(currentDate), 7).toISOString().split('T')[0];
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    let newDate;
    if (viewType === 'day') {
      newDate = addDays(new Date(currentDate), 1).toISOString().split('T')[0];
    } else if (viewType === 'week') {
      newDate = addDays(new Date(currentDate), 7).toISOString().split('T')[0];
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(today);
  };

  const dateLabel = formatDateFull(currentDate);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <button
        onClick={handlePrevious}
        style={{
          padding: '0.5rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          background: 'white',
        }}
        title="Previous"
      >
        ←
      </button>

      <div style={{ textAlign: 'center', minWidth: '200px' }}>
        <h2 style={{ fontWeight: 600, fontSize: '1.125rem', margin: 0 }}>{dateLabel}</h2>
      </div>

      <button
        onClick={handleNext}
        style={{
          padding: '0.5rem',
          border: '1px solid #d1d5db',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          background: 'white',
        }}
        title="Next"
      >
        →
      </button>

      {currentDate !== today && (
        <button
          onClick={handleToday}
          style={{
            padding: '0.375rem 0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            background: 'white',
            fontSize: '0.875rem',
            marginLeft: '0.5rem',
          }}
        >
          Today
        </button>
      )}
    </div>
  );
};

export default DateNavigator;
