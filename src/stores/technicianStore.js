import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import api from '@/services/api';

const useTechnicianStore = create(
  devtools(
    (set, get) => ({
      technicians: [],
      selectedTechnician: null,
      loading: false,
      error: null,

      fetchTechnicians: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/technicians');
          const technicians = response.data.data || response.data;
          set({ technicians, loading: false });
          return technicians;
        } catch (error) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      fetchTechnicianById: async (techId) => {
        try {
          const response = await api.get(`/technicians/${techId}`);
          const tech = response.data.data || response.data;
          set({ selectedTechnician: tech });
          return tech;
        } catch (error) {
          set({ error: error.message });
          throw error;
        }
      },

      getTechnicianSchedule: async (techId, date) => {
        try {
          const response = await api.get(`/technicians/${techId}/schedule?date=${date}`);
          return response.data.data || response.data;
        } catch (error) {
          console.error('Error fetching schedule:', error);
          throw error;
        }
      },

      getTechnicianUtilisation: async (techId, week) => {
        try {
          const response = await api.get(`/technicians/${techId}/utilisation?week=${week}`);
          return response.data.data || response.data;
        } catch (error) {
          console.error('Error fetching utilisation:', error);
          throw error;
        }
      },

      setSelectedTechnician: (tech) => set({ selectedTechnician: tech }),
      clearSelectedTechnician: () => set({ selectedTechnician: null }),

      getTechnicianById: (techId) => {
        const state = get();
        return state.technicians.find((tech) => tech.id === techId);
      },

      getAvailableTechnicians: () => {
        const state = get();
        return state.technicians.filter((tech) => tech.isAvailable);
      },

      getTechniciansBySpecialism: (specialism) => {
        const state = get();
        return state.technicians.filter((tech) => tech.specialisms?.includes(specialism));
      },
    }),
    { name: 'TechnicianStore' }
  )
);

export default useTechnicianStore;
