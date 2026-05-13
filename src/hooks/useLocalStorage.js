import { useState, useEffect } from 'react';

/**
 * Custom hook for persisting state to localStorage
 * Useful for UI preferences (sidebar state, view preference, filters, etc.)
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if key doesn't exist
 * @param {object} options - Optional configuration
 * @returns {[*, function]} - [storedValue, setValue]
 */
export const useLocalStorage = (key, initialValue, options = {}) => {
  const { deserialize = JSON.parse, serialize = JSON.stringify, syncData = true } = options;

  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: Failed to read key "${key}" from localStorage:`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serialize(valueToStore));
      }

      // Dispatch event to sync across tabs
      if (syncData && typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, newValue: valueToStore, oldValue: storedValue },
          })
        );
      }
    } catch (error) {
      console.warn(`useLocalStorage: Failed to write key "${key}" to localStorage:`, error);
    }
  };

  // Listen for changes in other tabs/windows
  useEffect(() => {
    if (!syncData || typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(deserialize(e.newValue));
        } catch (error) {
          console.warn(`useLocalStorage: Failed to parse storage value for key "${key}":`, error);
        }
      }
    };

    const handleCustomEvent = (e) => {
      if (e.detail?.key === key) {
        setStoredValue(e.detail.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleCustomEvent);
    };
  }, [key, syncData, deserialize]);

  return [storedValue, setValue];
};

/**
 * Hook for sidebar expansion state
 */
export const useSidebarState = (defaultExpanded = true) => {
  return useLocalStorage('workshop-sidebar-expanded', defaultExpanded);
};

/**
 * Hook for current view preference
 */
export const useCurrentView = (defaultView = 'day') => {
  return useLocalStorage('workshop-current-view', defaultView);
};

/**
 * Hook for current date
 */
export const useCurrentDate = (defaultDate = new Date().toISOString().split('T')[0]) => {
  return useLocalStorage('workshop-current-date', defaultDate);
};

/**
 * Hook for selected job ID
 */
export const useSelectedJob = (defaultJobId = null) => {
  return useLocalStorage('workshop-selected-job', defaultJobId);
};

/**
 * Hook for active filters
 */
export const useJobFilters = (defaultFilters = {}) => {
  return useLocalStorage('workshop-job-filters', defaultFilters);
};

/**
 * Hook for search query
 */
export const useSearchQuery = (defaultQuery = '') => {
  return useLocalStorage('workshop-search-query', defaultQuery);
};

/**
 * Hook for theme preference
 */
export const useThemePreference = (defaultTheme = 'light') => {
  return useLocalStorage('workshop-theme', defaultTheme);
};

/**
 * Hook for all workshop UI preferences as single object
 */
export const useWorkshopPreferences = (defaults = {}) => {
  const defaultPreferences = {
    sidebarExpanded: true,
    currentView: 'day',
    currentDate: new Date().toISOString().split('T')[0],
    selectedJob: null,
    filters: {},
    searchQuery: '',
    theme: 'light',
    ...defaults,
  };

  return useLocalStorage('workshop-preferences', defaultPreferences);
};

/**
 * Clear all workshop localStorage data
 */
export const clearWorkshopLocalStorage = () => {
  if (typeof window === 'undefined') return;

  const keys = [
    'workshop-sidebar-expanded',
    'workshop-current-view',
    'workshop-current-date',
    'workshop-selected-job',
    'workshop-job-filters',
    'workshop-search-query',
    'workshop-theme',
    'workshop-preferences',
  ];

  keys.forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove localStorage key "${key}":`, error);
    }
  });
};

/**
 * Get all workshop localStorage data
 */
export const getAllWorkshopLocalStorage = () => {
  if (typeof window === 'undefined') return {};

  const data = {};
  const keys = [
    'workshop-sidebar-expanded',
    'workshop-current-view',
    'workshop-current-date',
    'workshop-selected-job',
    'workshop-job-filters',
    'workshop-search-query',
    'workshop-theme',
    'workshop-preferences',
  ];

  keys.forEach((key) => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        data[key] = JSON.parse(item);
      }
    } catch (error) {
      console.warn(`Failed to parse localStorage key "${key}":`, error);
    }
  });

  return data;
};

export default useLocalStorage;
