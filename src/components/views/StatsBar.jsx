import React, { useMemo } from 'react';
import { useJobStore } from '@/stores/jobStore';
import { useUIStore } from '@/stores/uiStore';
import { Zap, Clock, Package, AlertCircle } from 'lucide-react';

/**
 * Stats Bar Component
 * Displays four key metrics: Total Jobs, Utilization %, Awaiting Parts, Overdue Jobs
 * Used in day/week views and dashboard
 *
 * @component
 * @param {string} selectedDate - Date to display stats for (YYYY-MM-DD)
 * @param {string} viewType - View type ('day' | 'week')
 * @returns {React.ReactElement}
 */
export const StatsBar = ({ selectedDate, viewType = 'day' }) => {
  const jobs = useJobStore((state) => state.jobs);

  // Filter jobs for selected period
  const relevantJobs = useMemo(() => {
    if (viewType === 'day') {
      // Single day
      const targetDate = new Date(selectedDate).toISOString().split('T')[0];
      return jobs.filter((job) => {
        const jobDate = new Date(job.date).toISOString().split('T')[0];
        return jobDate === targetDate;
      });
    } else if (viewType === 'week') {
      // Full week (Mon-Sat)
      const weekStart = new Date(selectedDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 5);

      return jobs.filter((job) => {
        const jobDate = new Date(job.date);
        return jobDate >= weekStart && jobDate <= weekEnd;
      });
    }
    return jobs;
  }, [jobs, selectedDate, viewType]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalJobs = relevantJobs.length;
    const awaitingParts = relevantJobs.filter((j) => j.status === 'awaiting_parts').length;
    const overdue = relevantJobs.filter((j) => j.status === 'overdue').length;

    // Calculate utilization (simplified: count scheduled jobs)
    const scheduled = relevantJobs.filter(
      (j) =>
        j.status === 'scheduled' ||
        j.status === 'in_progress' ||
        j.status === 'completed'
    ).length;
    const utilization = totalJobs > 0 ? Math.round((scheduled / totalJobs) * 100) : 0;

    return {
      totalJobs,
      utilization,
      awaitingParts,
      overdue,
    };
  }, [relevantJobs]);

  const StatCard = ({ icon: Icon, title, value, unit, color, className = '' }) => (
    <div
      className={`flex-1 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
            {unit && <span className="text-sm ml-1">{unit}</span>}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Total Jobs */}
      <StatCard
        icon={Clock}
        title="Total Jobs"
        value={stats.totalJobs}
        color="bg-blue-100 dark:bg-blue-900/30"
        className="hover:shadow-md transition-shadow"
      />

      {/* Utilization */}
      <StatCard
        icon={Zap}
        title="Utilization"
        value={stats.utilization}
        unit="%"
        color="bg-green-100 dark:bg-green-900/30"
        className="hover:shadow-md transition-shadow"
      />

      {/* Awaiting Parts */}
      <StatCard
        icon={Package}
        title="Awaiting Parts"
        value={stats.awaitingParts}
        color="bg-amber-100 dark:bg-amber-900/30"
        className="hover:shadow-md transition-shadow"
      />

      {/* Overdue */}
      <StatCard
        icon={AlertCircle}
        title="Overdue"
        value={stats.overdue}
        color={stats.overdue > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}
        className="hover:shadow-md transition-shadow"
      />
    </div>
  );
};

/**
 * Inline Stats Bar (direct styling)
 */
export const StatsBarInline = ({ selectedDate, viewType = 'day' }) => {
  const jobs = useJobStore((state) => state.jobs);

  const relevantJobs = useMemo(() => {
    if (viewType === 'day') {
      const targetDate = new Date(selectedDate).toISOString().split('T')[0];
      return jobs.filter((job) => {
        const jobDate = new Date(job.date).toISOString().split('T')[0];
        return jobDate === targetDate;
      });
    }
    return jobs;
  }, [jobs, selectedDate, viewType]);

  const stats = useMemo(() => {
    const totalJobs = relevantJobs.length;
    const awaitingParts = relevantJobs.filter((j) => j.status === 'awaiting_parts').length;
    const overdue = relevantJobs.filter((j) => j.status === 'overdue').length;
    const scheduled = relevantJobs.filter((j) => j.status === 'scheduled').length;
    const utilization = totalJobs > 0 ? Math.round((scheduled / totalJobs) * 100) : 0;

    return { totalJobs, utilization, awaitingParts, overdue };
  }, [relevantJobs]);

  const cardStyle = {
    flex: 1,
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    backgroundColor: '#ffffff',
  };

  const cardContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };

  const titleStyle = {
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#6b7280',
    marginBottom: '0.25rem',
  };

  const valueStyle = {
    fontSize: '1.875rem',
    fontWeight: 700,
    color: '#111827',
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '0.75rem',
        padding: '1rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div style={cardStyle}>
        <div style={cardContentStyle}>
          <div>
            <p style={titleStyle}>Total Jobs</p>
            <p style={valueStyle}>{stats.totalJobs}</p>
          </div>
          <div style={{ fontSize: '1.5rem' }}>⏱️</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={cardContentStyle}>
          <div>
            <p style={titleStyle}>Utilization</p>
            <p style={valueStyle}>{stats.utilization}%</p>
          </div>
          <div style={{ fontSize: '1.5rem' }}>⚡</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={cardContentStyle}>
          <div>
            <p style={titleStyle}>Awaiting Parts</p>
            <p style={valueStyle}>{stats.awaitingParts}</p>
          </div>
          <div style={{ fontSize: '1.5rem' }}>📦</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={cardContentStyle}>
          <div>
            <p style={titleStyle}>Overdue</p>
            <p style={valueStyle}>{stats.overdue}</p>
          </div>
          <div style={{ fontSize: '1.5rem', color: stats.overdue > 0 ? '#dc2626' : '#6b7280' }}>
            ⚠️
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
