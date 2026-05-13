import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { GlobalTopBar, GlobalTopBarCompact } from './GlobalTopBar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useUIStore } from '@/stores/uiStore';

/**
 * Workshop Layout Component
 * Main layout wrapper with header, sidebar, and content area
 * Responsive design with mobile hamburger menu
 *
 * @component
 * @param {React.ReactNode} children - Main content
 * @param {React.ReactNode} sidebar - Sidebar content (optional)
 * @param {array} notifications - Notifications list
 * @param {function} onNotificationClick - Notification callback
 * @param {string} className - Additional CSS classes
 * @returns {React.ReactElement}
 */
export const WorkshopLayout = ({
  children,
  sidebar = null,
  notifications = [],
  onNotificationClick = null,
  className = '',
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const [localSidebarOpen, setLocalSidebarOpen] = useState(sidebarOpen);

  const handleToggleSidebar = () => {
    setLocalSidebarOpen(!localSidebarOpen);
    setSidebarOpen(!localSidebarOpen);
  };

  const TopBar = isMobile ? GlobalTopBarCompact : GlobalTopBar;

  return (
    <div className={cn('flex flex-col h-screen bg-gray-50 dark:bg-gray-950', className)}>
      {/* Top Navigation Bar */}
      <header className="flex-shrink-0">
        <TopBar
          notifications={notifications}
          onNotificationClick={onNotificationClick}
        />
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <>
            {/* Mobile Sidebar Overlay */}
            {isMobile && localSidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                onClick={handleToggleSidebar}
              />
            )}

            {/* Sidebar */}
            <aside
              className={cn(
                'bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700',
                'transition-all duration-300',
                'w-64 flex-shrink-0',
                // Mobile sidebar
                'fixed left-0 top-0 h-full z-40 lg:static lg:translate-x-0',
                isMobile && !localSidebarOpen ? '-translate-x-full' : 'translate-x-0'
              )}
            >
              {/* Close button for mobile */}
              {isMobile && (
                <button
                  onClick={handleToggleSidebar}
                  className="lg:hidden absolute right-4 top-4 p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* Sidebar Content */}
              <div className="h-full overflow-y-auto pt-4 lg:pt-0">{sidebar}</div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Mobile Menu Toggle */}
          {sidebar && isMobile && (
            <button
              onClick={handleToggleSidebar}
              className="sticky top-0 left-0 m-4 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg z-10 lg:hidden"
              title="Toggle sidebar"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </button>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};

/**
 * Inline Workshop Layout (direct styling fallback)
 */
export const WorkshopLayoutInline = ({
  children,
  sidebar = null,
  notifications = [],
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f9fafb',
      }}
    >
      {/* Header */}
      <header
        style={{
          flexShrink: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Workshop Calendar</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                background: 'linear-gradient(to bottom right, #60a5fa, #2563eb)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              U
            </div>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        {sidebar && sidebarOpen && (
          <aside
            style={{
              width: '16rem',
              backgroundColor: 'white',
              borderRight: '1px solid #e5e7eb',
              overflowY: 'auto',
              flexShrink: 0,
            }}
          >
            {sidebar}
          </aside>
        )}

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f9fafb' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default WorkshopLayout;
