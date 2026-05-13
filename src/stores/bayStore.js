import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '@/services/api';

const useBayStore = create(
  devtools(
    (set, get) => ({
      bays: [],
      selectedBay: null,
      loading: false,
      error: null,

      fetchBays: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/bays');
          const bays = response.data.data || response.data;
          set({ bays, loading: false });
          return bays;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchBayById: async (bayId) => {
        try {
          const response = await api.get(`/bays/${bayId}`);
          const bay = response.data.data || response.data;
          set({ selectedBay: bay });
          return bay;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      checkAvailability: async (date, bayId) => {
        try {
          const response = await api.get(`/bays/availability?date=${date}&bayId=${bayId}`);
          return response.data.data || response.data;
        } catch (error) {
          console.error('Error checking availability:', error);
          throw error;
        }
      },

      setSelectedBay: (bay) => set({ selectedBay: bay }),
      clearSelectedBay: () => set({ selectedBay: null }),

      getBayById: (bayId) => {
        const state = get();
        return state.bays.find((bay) => bay.id === bayId);
      },

      getActiveBays: () => {
        const state = get();
        return state.bays.filter((bay) => bay.isActive);
      },
    }),
    { name: 'BayStore' }
  )
);

export default useBayStore;
