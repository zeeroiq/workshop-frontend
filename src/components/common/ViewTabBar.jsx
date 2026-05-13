import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, CalendarDays, Users, Package } from 'lucide-react';

/**
 * View Tab Bar Component
 * Shows tabs for Day, Week, Technician Roster, and Parts views
 * Active tab highlighted with bottom border accent
 *
 * @component
 * @param {string} activeView - Currently active view ('day' | 'week' | 'roster' | 'parts')
 * @param {function} onViewChange - Callback when view changes
 * @param {string} className - Additional CSS classes
 * @returns {React.ReactElement}
 */
export const ViewTabBar = ({ activeView = 'day', onViewChange, className = '' }) => {
  const views = [
    { id: 'day', label: 'Day Schedule', icon: Calendar },
    { id: 'week', label: 'Week View', icon: CalendarDays },
    { id: 'roster', label: 'Technician Roster', icon: Users },
    { id: 'parts', label: 'Parts Dashboard', icon: Package },
  ];

  return (
    <div
      className={cn(
        'flex items-center gap-1 border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700',
        className
      )}
    >
      {views.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all',
            'border-b-2 border-transparent',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            activeView === id
              ? 'border-b-blue-600 text-blue-600 dark:border-b-blue-500 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300'
          )}
          role="tab"
          aria-selected={activeView === id}
          aria-controls={`${id}-panel`}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{label.split(' ')[0]}</span>
        </button>
      ))}
    </div>
  );
};

/**
 * Inline View Tab Bar (with direct styling)
 */
export const ViewTabBarInline = ({ activeView = 'day', onViewChange }) => {
  const views = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'roster', label: 'Roster' },
    { id: 'parts', label: 'Parts' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #d1d5db',
        backgroundColor: '#ffffff',
        gap: '0.25rem',
      }}
    >
      {views.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          style={{
            padding: '0.75rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeView === id ? '2px solid #2563eb' : '2px solid transparent',
            color: activeView === id ? '#2563eb' : '#374151',
            backgroundColor: 'transparent',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (activeView !== id) {
              e.target.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== id) {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ViewTabBar;
