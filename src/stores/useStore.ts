// ==================== FIXED STORE: src/stores/useStore.ts ====================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState } from '../types';

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      selectedDepartmentId: null,
      selectedYear: null,  // ADDED

      setSelectedDepartment: (id: number) => 
        set({ selectedDepartmentId: id }),

      setSelectedYear: (year: string) =>  // ADDED
        set({ selectedYear: year }),

      clearSelectedDepartment: () => 
        set({ selectedDepartmentId: null, selectedYear: null }),  // UPDATED to clear year too
    }),
    {
      name: 'cafphy-storage', // localStorage key
    }
  )
);

