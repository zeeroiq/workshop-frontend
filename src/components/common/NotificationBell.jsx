import React, { useState, useRef, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime, formatDateShort } from '@/utils/dateFormatting';

/**
 * Notification Bell Component
 * Shows badge with unread count and dropdown list of recent alerts
 *
 * @component
 * @param {array} notifications - Array of notification objects
 * @param {function} onNotificationClick - Callback when notification clicked
 * @param {function} onMarkAsRead - Callback to mark notification as read
 * @param {function} onClearAll - Callback to clear all notifications
 * @returns {React.ReactElement}
 */
export const NotificationBell = ({
  notifications = [],
  onNotificationClick = null,
  onMarkAsRead = null,
  onClearAll = null,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
          'rounded-full transition-colors'
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
        title="Notifications"
      >
        <Bell className="h-5 w-5" />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <>
              {recentNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-700',
                    'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors last:border-b-0',
                    !notification.isRead && 'bg-blue-50 dark:bg-blue-900/10'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-sm truncate',
                          !notification.isRead
                            ? 'font-semibold text-gray-900 dark:text-white'
                            : 'font-medium text-gray-700 dark:text-gray-300'
                        )}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {notification.timestamp &&
                          formatDateShort(new Date(notification.timestamp))}
                      </p>
                    </div>

                    {/* Badge */}
                    {notification.type && (
                      <span
                        className={cn(
                          'text-xs font-medium px-2 py-1 rounded whitespace-nowrap flex-shrink-0',
                          notification.type === 'urgent'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            : notification.type === 'info'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        )}
                      >
                        {notification.type}
                      </span>
                    )}
                  </div>
                </button>
              ))}

              {/* Show more link */}
              {notifications.length > 5 && (
                <button
                  className="w-full text-center px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  View all {notifications.length} notifications
                </button>
              )}

              {/* Clear all button */}
              {onClearAll && (
                <button
                  onClick={onClearAll}
                  className="w-full text-center px-4 py-2 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border-t border-gray-100 dark:border-gray-700"
                >
                  Clear all
                </button>
              )}
            </>
          ) : (
            <div className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Inline Notification Bell (direct styling)
 */
export const NotificationBellInline = ({
  notifications = [],
  onNotificationClick = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          padding: '0.5rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.25rem',
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '0.25rem',
              right: '0.25rem',
              width: '1.25rem',
              height: '1.25rem',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '0.5rem',
            width: '20rem',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            boxShadow: '0 20px 25px rgba(0,0,0,0.1)',
            zIndex: 50,
            maxHeight: '384px',
            overflowY: 'auto',
          }}
        >
          {notifications.length > 0 ? (
            notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (onNotificationClick) onNotificationClick(n);
                  setIsOpen(false);
                }}
                style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  backgroundColor: !n.isRead ? '#f0f9ff' : 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = !n.isRead ? '#f0f9ff' : 'white';
                }}
              >
                <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  {n.title}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  {n.message}
                </p>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
              No notifications
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
