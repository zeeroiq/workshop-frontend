import React from 'react';
import { cn } from '@/lib/utils';
import { DateNavigator } from './DateNavigator';
import { ViewTabBar } from './ViewTabBar';
import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';
import { useUIStore } from '@/stores/uiStore';
import { useJobStore } from '@/stores/jobStore';

/**
 * Global Top Bar Component
 * Assembles DateNavigator, ViewTabBar, GlobalSearch, and NotificationBell
 * Serves as the main navigation header for the application
 *
 * @component
 * @param {function} onJobSearch - Callback when job selected from search
 * @param {array} notifications - List of notifications
 * @param {function} onNotificationClick - Callback on notification click
 * @param {string} className - Additional CSS classes
 * @returns {React.ReactElement}
 */
export const GlobalTopBar = ({
  onJobSearch = null,
  notifications = [],
  onNotificationClick = null,
  className = '',
}) => {
  // Get UI state from store
  const { currentDate, setCurrentDate, currentView, setCurrentView } = useUIStore();

  // Get jobs for search
  const jobs = useJobStore((state) => state.jobs);

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleViewChange = (newView) => {
    setCurrentView(newView);
  };

  const handleJobSelect = (job) => {
    if (onJobSearch) {
      onJobSearch(job);
    }
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700',
        'sticky top-0 z-40',
        className
      )}
    >
      {/* Top row: Logo, Search, Notifications */}
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        {/* Logo/Title */}
        <div className="flex-shrink-0">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Workshop Calendar</h1>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md">
          <GlobalSearch
            jobs={jobs}
            onSelectResult={handleJobSelect}
            placeholder="Search WO, customer..."
          />
        </div>

        {/* Right: Notifications + User Menu */}
        <div className="flex items-center gap-4">
          <NotificationBell
            notifications={notifications}
            onNotificationClick={onNotificationClick}
          />

          {/* User Profile (placeholder) */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
        </div>
      </div>

      {/* Second row: Date Navigator */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <DateNavigator
          currentDate={currentDate}
          onDateChange={handleDateChange}
          viewType={currentView}
        />
      </div>

      {/* Third row: View Tabs */}
      <div>
        <ViewTabBar activeView={currentView} onViewChange={handleViewChange} />
      </div>
    </div>
  );
};

/**
 * Compact Global Top Bar (mobile)
 */
export const GlobalTopBarCompact = ({
  onJobSearch = null,
  notifications = [],
  onNotificationClick = null,
}) => {
  const { currentDate, setCurrentDate, currentView, setCurrentView } = useUIStore();
  const jobs = useJobStore((state) => state.jobs);

  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      {/* Single row for mobile */}
      <div className="flex items-center justify-between px-3 py-2 gap-3">
        {/* Logo */}
        <h1 className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">WC</h1>

        {/* Search */}
        <div className="flex-1 min-w-0">
          <GlobalSearch
            jobs={jobs}
            onSelectResult={(job) => onJobSearch?.(job)}
            placeholder="Search..."
            className="max-w-none"
          />
        </div>

        {/* Notifications */}
        <div className="flex-shrink-0">
          <NotificationBell
            notifications={notifications}
            onNotificationClick={onNotificationClick}
          />
        </div>
      </div>

      {/* Date and view tabs below */}
      <div className="border-t border-gray-100 dark:border-gray-700 px-2 py-2">
        <DateNavigator
          currentDate={currentDate}
          onDateChange={(d) => setCurrentDate(d)}
          viewType={currentView}
          className="justify-center"
        />
      </div>

      <ViewTabBar activeView={currentView} onViewChange={setCurrentView} />
    </div>
  );
};

export default GlobalTopBar;
