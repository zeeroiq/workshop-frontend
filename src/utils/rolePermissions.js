import React from 'react';
import { useUIStore } from '@/stores/uiStore';

/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines which roles can access which views and features
 */
const ROLE_PERMISSIONS = {
  admin: {
    views: ['day', 'week', 'roster', 'parts'],
    features: ['edit_jobs', 'delete_jobs', 'manage_technicians', 'manage_bays', 'manage_users'],
    canSeeAllData: true,
  },
  manager: {
    views: ['day', 'week', 'roster', 'parts'],
    features: ['edit_jobs', 'manage_technicians', 'manage_bays'],
    canSeeAllData: true,
  },
  technician: {
    views: ['day', 'roster'],
    features: ['update_job_status', 'view_assignments'],
    canSeeAllData: false,
  },
  customer_service: {
    views: ['day', 'week', 'parts'],
    features: ['edit_jobs', 'manage_parts'],
    canSeeAllData: false,
  },
  parts_manager: {
    views: ['parts'],
    features: ['manage_parts', 'track_deliveries'],
    canSeeAllData: false,
  },
};

/**
 * Check if a role has access to a view
 * @param {string} role - User role
 * @param {string} view - View name
 * @returns {boolean} Whether role can access view
 */
export const canAccessView = (role, view) => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.views.includes(view) : false;
};

/**
 * Check if a role has a specific feature permission
 * @param {string} role - User role
 * @param {string} feature - Feature name
 * @returns {boolean} Whether role has feature permission
 */
export const canAccessFeature = (role, feature) => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.features.includes(feature) : false;
};

/**
 * Get all accessible views for a role
 * @param {string} role - User role
 * @returns {array} List of accessible views
 */
export const getAccessibleViews = (role) => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.views : [];
};

/**
 * ProtectedView Component
 * Wraps a view component and only renders if user has access
 *
 * @component
 * @param {React.ReactNode} children - Component to render
 * @param {string} requiredView - View name to check access for
 * @param {string} userRole - Current user role
 * @param {React.ReactNode} fallback - Component to render if access denied
 * @returns {React.ReactElement}
 */
export const ProtectedView = ({
  children,
  requiredView,
  userRole,
  fallback = null,
}) => {
  if (!canAccessView(userRole, requiredView)) {
    return fallback || (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You do not have permission to view this section.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

/**
 * ProtectedFeature Component
 * Wraps a feature and only renders if user has access
 *
 * @component
 * @param {React.ReactNode} children - Feature to render
 * @param {string} requiredFeature - Feature name to check access for
 * @param {string} userRole - Current user role
 * @param {boolean} hideIfDenied - Hide element or show placeholder
 * @returns {React.ReactElement | null}
 */
export const ProtectedFeature = ({
  children,
  requiredFeature,
  userRole,
  hideIfDenied = true,
}) => {
  if (!canAccessFeature(userRole, requiredFeature)) {
    return hideIfDenied ? null : (
      <div className="p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-sm text-gray-600 dark:text-gray-400">
        This feature is not available for your role.
      </div>
    );
  }

  return children;
};

/**
 * useRolePermissions Hook
 * Access role permission utilities from anywhere in the app
 *
 * @returns {object} Permission checking functions
 */
export const useRolePermissions = (userRole) => {
  return {
    canAccessView: (view) => canAccessView(userRole, view),
    canAccessFeature: (feature) => canAccessFeature(userRole, feature),
    getAccessibleViews: () => getAccessibleViews(userRole),
    hasAllFeatures: (features) => features.every((f) => canAccessFeature(userRole, f)),
  };
};

/**
 * ViewAccessGate Hook
 * Auto-hides views that the user doesn't have access to
 * Used by ViewTabBar to filter available views
 */
export const useViewAccessGate = (userRole) => {
  const { currentView, setCurrentView } = useUIStore();
  const allViews = ['day', 'week', 'roster', 'parts'];

  // Get accessible views for this role
  const accessibleViews = getAccessibleViews(userRole);

  // If current view is not accessible, switch to first accessible view
  React.useEffect(() => {
    if (!canAccessView(userRole, currentView)) {
      const firstAccessibleView = accessibleViews[0] || 'day';
      setCurrentView(firstAccessibleView);
    }
  }, [userRole, currentView, accessibleViews, setCurrentView]);

  return {
    accessibleViews,
    canViewSwitch: (newView) => canAccessView(userRole, newView),
  };
};

export default ProtectedView;
