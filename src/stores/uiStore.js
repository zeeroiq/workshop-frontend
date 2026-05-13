import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useUIStore = create(
  devtools(
    persist(
      (set) => ({
        currentView: 'day', // 'day' | 'week' | 'roster' | 'parts'
        currentDate: new Date().toISOString().split('T')[0],
        sidebarExpanded: true,
        selectedJobId: null,
        filters: {},
        searchQuery: '',
        showDetailPanel: false,
        detailPanelJob: null,
        showNewJobModal: false,
        showStatusModal: false,
        showNotifyModal: false,
        showFiltersPanel: false,

        // View actions
        setCurrentView: (view) => set({ currentView: view }),
        setCurrentDate: (date) => set({ currentDate: date }),
        setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
        toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),

        // Job selection
        setSelectedJobId: (jobId) => set({ selectedJobId: jobId }),
        clearSelectedJobId: () => set({ selectedJobId: null }),

        // Detail panel
        setShowDetailPanel: (show) => set({ showDetailPanel: show }),
        setDetailPanelJob: (job) => set({ detailPanelJob: job, showDetailPanel: Boolean(job) }),
        closeDetailPanel: () => set({ showDetailPanel: false, detailPanelJob: null }),

        // Modals
        setShowNewJobModal: (show) => set({ showNewJobModal: show }),
        setShowStatusModal: (show) => set({ showStatusModal: show }),
        setShowNotifyModal: (show) => set({ showNotifyModal: show }),
        setShowFiltersPanel: (show) => set({ showFiltersPanel: show }),

        // Filters
        setFilters: (filters) => set({ filters }),
        clearFilters: () => set({ filters: {} }),
        addFilter: (key, value) => set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),
        removeFilter: (key) => set((state) => {
          const newFilters = { ...state.filters };
          delete newFilters[key];
          return { filters: newFilters };
        }),

        // Search
        setSearchQuery: (query) => set({ searchQuery: query }),
        clearSearchQuery: () => set({ searchQuery: '' }),
      }),
      {
        name: 'workshop-ui-store',
        partialize: (state) => ({
          currentView: state.currentView,
          sidebarExpanded: state.sidebarExpanded,
          filters: state.filters,
        }),
      }
    ),
    { name: 'UIStore' }
  )
);

export default useUIStore;
